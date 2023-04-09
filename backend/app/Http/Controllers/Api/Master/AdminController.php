<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = Admin::latest();

        if ($request->has('search') && $request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('username', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('full_name', 'like', "%{$request->search}%");
            });
        }

        if ($request->has('is_master') && $request->has('is_master')) {
            $query->where('is_master', $request->boolean('is_master'));
        }

        if ($request->has('is_active') && $request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $admins = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $admins->map(function ($admin) {
                return [
                    'id' => $admin->id,
                    'username' => $admin->username,
                    'email' => $admin->email,
                    'full_name' => $admin->full_name,
                    'is_master' => $admin->is_master,
                    'is_active' => $admin->is_active,
                    'last_login_at' => $admin->last_login_at?->toISOString(),
                    'created_at' => $admin->created_at?->toISOString(),
                ];
            }),
            'pagination' => [
                'current_page' => $admins->currentPage(),
                'last_page' => $admins->lastPage(),
                'total' => $admins->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:50|unique:admins,username',
            'email' => 'required|email|max:255|unique:admins,email',
            'password' => 'required|string|min:10',
            'full_name' => 'required|string|max:100',
            'bank_access_token' => 'required|string|min:16|max:64',
            'is_master' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $admin = Admin::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'full_name' => $request->full_name,
            'bank_access_token' => $request->bank_access_token,
            'is_master' => $request->boolean('is_master', false),
            'is_active' => $request->boolean('is_active', true),
        ]);

        // Assign role
        if ($admin->is_master) {
            $admin->assignRole('master_admin');
        } else {
            $admin->assignRole('admin');
        }

        \App\Models\AuditLog::log(
            'admin_created',
            'admin',
            $admin->id,
            $request->user(),
            [],
            [
                'username' => $admin->username,
                'is_master' => $admin->is_master,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Admin created successfully',
            'data' => [
                'id' => $admin->id,
            ],
        ], 201);
    }

    public function show(Request $request, Admin $admin): JsonResponse
    {
        $admin->load('roles', 'permissions');

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $admin->id,
                'username' => $admin->username,
                'email' => $admin->email,
                'full_name' => $admin->full_name,
                'is_master' => $admin->is_master,
                'is_active' => $admin->is_active,
                'last_login_at' => $admin->last_login_at?->toISOString(),
                'last_login_ip' => $admin->last_login_ip,
                'created_at' => $admin->created_at?->toISOString(),
                'roles' => $admin->roles->pluck('name'),
                'permissions' => $admin->getAllPermissions()->pluck('name'),
            ],
        ]);
    }

    public function update(Request $request, Admin $admin): JsonResponse
    {
        if ($admin->id === $request->user()->id && $request->has('is_active') && !$request->boolean('is_active')) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot deactivate your own account',
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'username' => 'sometimes|required|string|max:50|unique:admins,username,' . $admin->id,
            'email' => 'sometimes|required|email|max:255|unique:admins,email,' . $admin->id,
            'password' => 'nullable|string|min:10',
            'full_name' => 'sometimes|required|string|max:100',
            'bank_access_token' => 'nullable|string|min:16|max:64',
            'is_master' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $wasMaster = $admin->is_master;
        $admin->update($data);

        // Update roles if master status changed
        if (isset($data['is_master']) && $data['is_master'] !== $wasMaster) {
            $admin->syncRoles($data['is_master'] ? ['master_admin'] : ['admin']);
        }

        \App\Models\AuditLog::log(
            'admin_updated',
            'admin',
            $admin->id,
            $request->user(),
            ['was_master' => $wasMaster],
            ['is_master' => $admin->is_master, 'is_active' => $admin->is_active]
        );

        return response()->json([
            'success' => true,
            'message' => 'Admin updated successfully',
        ]);
    }

    public function destroy(Request $request, Admin $admin): JsonResponse
    {
        if ($admin->id === $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete your own account',
            ], 422);
        }

        if ($admin->is_master && \App\Models\Admin::where('is_master', true)->count() <= 1) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete the last master admin',
            ], 422);
        }

        $admin->delete();

        \App\Models\AuditLog::log(
            'admin_deleted',
            'admin',
            $admin->id,
            $request->user(),
            [],
            ['deleted_admin' => $admin->username]
        );

        return response()->json([
            'success' => true,
            'message' => 'Admin deleted successfully',
        ]);
    }
}