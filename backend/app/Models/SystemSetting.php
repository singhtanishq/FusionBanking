<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    use HasFactory;

    protected $table = 'system_settings';

    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
        'is_public',
        'group',
        'validation_rules',
    ];

    protected $casts = [
        'value' => 'array',
        'is_public' => 'boolean',
        'validation_rules' => 'array',
    ];

    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        if (!$setting) return $default;
        
        return match ($setting->type) {
            'integer' => (int) $setting->value,
            'float' => (float) $setting->value,
            'boolean' => (bool) $setting->value,
            'json' => $setting->value,
            default => $setting->value,
        };
    }

    public static function set(string $key, $value): void
    {
        self::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );
    }
}