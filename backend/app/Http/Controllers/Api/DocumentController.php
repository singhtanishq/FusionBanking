<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KycDocument;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class DocumentController extends Controller
{
    public function download(Request $request, KycDocument $document): JsonResponse
    {
        // Check authorization - admin or document owner
        $user = $request->user();
        $authorized = false;

        if ($user instanceof \App\Models\Admin) {
            $authorized = true;
        } elseif ($user instanceof \App\Models\Customer) {
            $application = $document->application;
            if ($application && $application->customer_id === $user->id) {
                $authorized = true;
            }
        }

        if (!$authorized) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        if (!\Illuminate\Support\Facades\Storage::disk('private')->exists($document->file_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File not found',
            ], 404);
        }

        return \Illuminate\Support\Facades\Storage::disk('private')->download(
            $document->file_path,
            $document->original_filename,
            ['Content-Type' => $document->mime_type]
        );
    }
}