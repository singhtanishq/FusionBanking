<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class PromotionController extends Controller
{
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = Promotion::latest();

        if ($request->has('status') && $request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $promotions = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $promotions->map(function ($promo) {
                return [
                    'id' => $promo->id,
                    'title' => $promo->title,
                    'subtitle' => $promo->subtitle,
                    'image_url' => $promo->image_url ? Storage::url($promo->image_url) : null,
                    'cta_text' => $promo->cta_text,
                    'cta_url' => $promo->cta_url,
                    'is_active' => $promo->is_active,
                    'display_order' => $promo->display_order,
                    'starts_at' => $promo->starts_at?->toISOString(),
                    'expires_at' => $promo->expires_at?->toISOString(),
                    'created_at' => $promo->created_at?->toISOString(),
                ];
            }),
            'pagination' => [
                'current_page' => $promotions->currentPage(),
                'last_page' => $promotions->lastPage(),
                'total' => $promotions->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'image' => 'nullable|image|max:2048',
            'cta_text' => 'nullable|string|max:50',
            'cta_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
            'display_order' => 'integer|min:0',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        if ($request->hasFile('image')) {
            $data['image_url'] = $request->file('image')->store('promotions', 'public');
        }

        $promotion = Promotion::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Promotion created successfully',
            'data' => [
                'id' => $promotion->id,
            ],
        ], 201);
    }

    public function update(Request $request, Promotion $promotion): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'image' => 'nullable|image|max:2048',
            'cta_text' => 'nullable|string|max:50',
            'cta_url' => 'nullable|url|max:255',
            'is_active' => 'boolean',
            'display_order' => 'integer|min:0',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        if ($request->hasFile('image')) {
            // Delete old image
            if ($promotion->image_url) {
                Storage::disk('public')->delete($promotion->image_url);
            }
            $data['image_url'] = $request->file('image')->store('promotions', 'public');
        }

        $promotion->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Promotion updated successfully',
        ]);
    }

    public function destroy(Promotion $promotion): JsonResponse
    {
        if ($promotion->image_url) {
            Storage::disk('public')->delete($promotion->image_url);
        }

        $promotion->delete();

        return response()->json([
            'success' => true,
            'message' => 'Promotion deleted',
        ]);
    }
}