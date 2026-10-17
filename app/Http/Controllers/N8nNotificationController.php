<?php

namespace App\Http\Controllers;

use Illuminate\Http\Client\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Throwable;

class N8nNotificationController extends Controller
{
    /**
     * Kirim notifikasi aktivitas ERP ke Webhook n8n (dan/atau Fonnte WA Gateway).
     */
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'aksi' => ['required', 'string', 'max:100'],
            'modul' => ['required', 'string', 'max:150'],
            'nama_item' => ['required', 'string', 'max:255'],
            'divisi' => ['nullable', 'string', 'max:255'],
            'nilai' => ['nullable', 'string', 'max:150'],
            'status' => ['nullable', 'string', 'max:100'],
            'admin' => ['nullable', 'string', 'max:255'],
            'waktu' => ['nullable', 'string', 'max:150'],
            'webhook_url' => ['nullable', 'url', 'max:500'],
            'fonnte_token' => ['nullable', 'string', 'max:255'],
            'fonnte_target' => ['nullable', 'string', 'max:50'],
        ]);

        if (str_contains(strtolower($validated['modul']), 'invoice')) {
            return response()->json([
                'ok' => true,
                'skipped' => true,
                'message' => 'Notifikasi invoice dinonaktifkan sesuai kebijakan perusahaan (hanya untuk dicetak).',
            ]);
        }

        $flatPayload = [
            'aksi' => $validated['aksi'],
            'modul' => $validated['modul'],
            'nama_item' => $validated['nama_item'],
            'divisi' => $validated['divisi'] ?? '-',
            'nilai' => $validated['nilai'] ?? '-',
            'status' => $validated['status'] ?? '-',
            'admin' => $validated['admin'] ?? 'Admin ERP',
            'waktu' => $validated['waktu'] ?? now()->timezone('Asia/Jakarta')->format('d/m/Y H:i:s'),
        ];

        $formattedMessage = "*NOTIFIKASI ERP SATARYA* 🏗️\n"
            ."Halo Owner, Admin baru saja melakukan *{$flatPayload['aksi']}* pada modul *{$flatPayload['modul']}*.\n\n"
            ."📋 *Detail Data:*\n"
            ."• Nama Proyek/Item: {$flatPayload['nama_item']}\n"
            ."• Klien/Divisi: {$flatPayload['divisi']}\n"
            ."• Nilai/Anggaran: {$flatPayload['nilai']}\n"
            ."• Status: {$flatPayload['status']}\n"
            ."• Diupdate Oleh: {$flatPayload['admin']}\n"
            ."• Waktu: {$flatPayload['waktu']}";

        $payload = array_merge($flatPayload, [
            'message' => $formattedMessage,
            'pesan' => $formattedMessage,
            'body' => $flatPayload,
            'query' => $flatPayload,
        ]);

        $webhookUrl = trim((string) (! empty($validated['webhook_url']) ? $validated['webhook_url'] : config('services.n8n.webhook_url')));
        $fonnteToken = trim((string) (! empty($validated['fonnte_token']) ? $validated['fonnte_token'] : config('services.fonnte.token')));
        $fonnteTarget = trim((string) (! empty($validated['fonnte_target']) ? $validated['fonnte_target'] : config('services.fonnte.target')));

        if ($webhookUrl === '' && $fonnteToken === '') {
            return response()->json([
                'ok' => false,
                'message' => 'URL Webhook n8n belum dikonfigurasi.',
            ], 422);
        }

        try {
            $n8nOk = false;
            $n8nStatus = null;
            $n8nData = null;

            if ($webhookUrl !== '') {
                $response = $this->dispatchWithFallback($webhookUrl, $payload, $flatPayload);
                $n8nOk = $response->successful();
                $n8nStatus = $response->status();
                $n8nData = $response->json() ?? $response->body();
            }

            $fonnteOk = false;
            $fonnteData = null;

            if ($fonnteToken !== '' && $fonnteTarget !== '') {
                $fonnteRes = Http::withoutVerifying()
                    ->connectTimeout(3)
                    ->timeout(10)
                    ->withHeaders([
                        'Authorization' => $fonnteToken,
                    ])
                    ->post('https://api.fonnte.com/send', [
                        'target' => $fonnteTarget,
                        'message' => $formattedMessage,
                    ]);

                $fonntejson = $fonnteRes->json();
                $fonnteOk = $fonnteRes->successful() && (is_array($fonntejson) ? ($fonntejson['status'] ?? false) === true : true);
                $fonnteData = $fonntejson ?? $fonnteRes->body();
            }

            $overallOk = $n8nOk || $fonnteOk;

            return response()->json([
                'ok' => $overallOk,
                'status' => $n8nStatus ?? ($fonnteOk ? 200 : 502),
                'n8n_ok' => $n8nOk,
                'n8n_response' => $n8nData,
                'fonnte_ok' => $fonnteOk,
                'fonnte_response' => $fonnteData,
            ], $overallOk ? 200 : 502);
        } catch (Throwable $e) {
            return response()->json([
                'ok' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Kirim POST (dengan query string + JSON body agar $json.body & $json.query di n8n keduanya terisi),
     * lalu fallback ke Test URL atau GET jika diperlukan.
     *
     * @param  array<string, mixed>  $payload
     * @param  array<string, string>  $flatPayload
     */
    private function dispatchWithFallback(string $webhookUrl, array $payload, array $flatPayload): Response
    {
        $urls = [$webhookUrl];

        if (str_contains($webhookUrl, '/webhook/')) {
            $urls[] = str_replace('/webhook/', '/webhook-test/', $webhookUrl);
        } elseif (str_contains($webhookUrl, '/webhook-test/')) {
            $urls[] = str_replace('/webhook-test/', '/webhook/', $webhookUrl);
        }

        $lastResponse = null;

        foreach ($urls as $url) {
            $separator = str_contains($url, '?') ? '&' : '?';
            $urlWithQuery = $url.$separator.http_build_query($flatPayload);

            $lastResponse = Http::withoutVerifying()
                ->connectTimeout(3)
                ->timeout(10)
                ->post($urlWithQuery, $payload);

            if ($lastResponse->successful()) {
                return $lastResponse;
            }
        }

        if ($lastResponse !== null && $lastResponse->status() === 404) {
            foreach ($urls as $url) {
                $getResponse = Http::withoutVerifying()
                    ->connectTimeout(3)
                    ->timeout(10)
                    ->get($url, $flatPayload);

                if ($getResponse->successful()) {
                    return $getResponse;
                }
                $lastResponse = $getResponse;
            }
        }

        return $lastResponse;
    }
}
