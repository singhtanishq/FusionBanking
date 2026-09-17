<?php

namespace App\Http\Controllers\Api\Master;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SystemSetting::query();

        if ($request->has('group') && $request->group) {
            $query->where('group', $request->group);
        }

        $settings = $query->orderBy('group')->orderBy('key')->get();

        return response()->json([
            'success' => true,
            'data' => $settings->map(function ($setting) {
                return [
                    'key' => $setting->key,
                    'value' => $setting->value,
                    'type' => $setting->type,
                    'description' => $setting->description,
                    'is_public' => $setting->is_public,
                    'group' => $setting->group,
                    'validation_rules' => $setting->validation_rules,
                ];
            }),
        ]);
    }

    public function update(Request $request, string $key): JsonResponse
    {
        $setting = SystemSetting::where('key', $key)->firstOrFail();

        $validator = Validator::make($request->all(), [
            'value' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide a valid value.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Validate based on type
        $value = $request->value;
        switch ($setting->type) {
            case 'integer':
                $value = (int) $value;
                break;
            case 'float':
                $value = (float) $value;
                break;
            case 'boolean':
                $value = (bool) $value;
                break;
            case 'json':
                if (is_string($value)) {
                    $value = json_decode($value, true);
                }
                break;
        }

        $oldValue = $setting->value;
        $setting->update(['value' => $value]);

        \App\Models\AuditLog::log(
            'setting_updated',
            'system_setting',
            $setting->id,
            $request->user(),
            ['old_value' => $oldValue],
            ['new_value' => $value]
        );

        return response()->json([
            'success' => true,
            'message' => 'Setting updated successfully',
            'data' => [
                'key' => $setting->key,
                'value' => $setting->fresh()->value,
            ],
        ]);
    }

    public function bulkUpdate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|exists:system_settings,key',
            'settings.*.value' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validator->errors(),
            ], 422);
        }

        foreach ($request->settings as $item) {
            $setting = SystemSetting::where('key', $item['key'])->first();
            if (!$setting) continue;

            $value = $item['value'];
            switch ($setting->type) {
                case 'integer':
                    $value = (int) $value;
                    break;
                case 'float':
                    $value = (float) $value;
                    break;
                case 'boolean':
                    $value = (bool) $value;
                    break;
                case 'json':
                    if (is_string($value)) {
                        $value = json_decode($value, true);
                    }
                    break;
            }

            $oldValue = $setting->value;
            $setting->update(['value' => $value]);

            \App\Models\AuditLog::log(
                'setting_updated',
                'system_setting',
                $setting->id,
                $request->user(),
                ['old_value' => $oldValue],
                ['new_value' => $value]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully',
        ]);
    }
}