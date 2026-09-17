<?php

namespace App\Http\Controllers\Api;

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
        $query = Promotion::query();

        // Only active promotions for public API
        if ($request->has('active_only') && $request->boolean('active_only')) {
            $query->where('is_active', true);
        }

        $query->where(function ($q) {
            $q->whereNull('starts_at')
              ->orWhere('starts_at', '<=', now());
        })->where(function ($q) {
            $q->whereNull('expires_at')
              ->orWhere('expires_at', '>=', now());
        });

        $query->orderBy('display_order');

        $promotions = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $promotions->map(function ($promotion) {
                return [
                    'id' => $promotion->id,
                    'title' => $promotion->title,
                    'subtitle' => $promotion->subtitle,
                    'image_url' => $promotion->image_url ? \Illuminate\Support\Facades\Storage::url($promotion->image_url) : null,
                    'cta_text' => $promotion->cta_text,
                    'cta_url' => $promotion->cta_url,
                    'display_order' => $promotion->display_order,
                ];
            }),
            'pagination' => [
                'current_page' => $promotions->currentPage(),
                'last_page' => $promotions->lastPage(),
                'total' => $promotions->total(),
            ],
        ]);
    }
}