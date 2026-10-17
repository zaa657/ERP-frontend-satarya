<?php

namespace Tests\Feature;

use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class N8nNotificationTest extends TestCase
{
    public function test_it_sends_notification_payload_to_n8n_webhook(): void
    {
        Http::preventStrayRequests();

        $webhookUrl = 'https://satarya-erp.app.n8n.cloud/webhook/2e639377-58a6-438d-9c4c-98ee82a6a47f';
        config([
            'services.n8n.webhook_url' => $webhookUrl,
            'services.fonnte.token' => '',
        ]);

        Http::fake([
            'https://satarya-erp.app.n8n.cloud/webhook/*' => Http::response(['message' => 'Workflow was started'], 200),
        ]);

        $response = $this->postJson(route('n8n.notify'), [
            'aksi' => 'Penambahan Data Baru',
            'modul' => 'Proyek Klien',
            'nama_item' => 'Renovasi Gedung A',
            'divisi' => 'PT. Maju Jaya',
            'nilai' => 'Rp 250.000.000',
            'status' => 'Berjalan',
            'admin' => 'admin@satarya.com (ADMIN)',
            'waktu' => '16 Okt 2026, 13.00',
        ]);

        $response->assertOk()
            ->assertJson([
                'ok' => true,
                'status' => 200,
                'n8n_ok' => true,
            ]);

        Http::assertSent(function (Request $request) use ($webhookUrl): bool {
            return str_starts_with($request->url(), $webhookUrl)
                && $request['aksi'] === 'Penambahan Data Baru'
                && $request['modul'] === 'Proyek Klien'
                && $request['nama_item'] === 'Renovasi Gedung A';
        });
    }

    public function test_it_falls_back_to_test_webhook_when_production_returns_404(): void
    {
        Http::preventStrayRequests();

        $prodUrl = 'https://satarya-erp.app.n8n.cloud/webhook/2e639377-58a6-438d-9c4c-98ee82a6a47f';
        $testUrl = 'https://satarya-erp.app.n8n.cloud/webhook-test/2e639377-58a6-438d-9c4c-98ee82a6a47f';
        config([
            'services.n8n.webhook_url' => $prodUrl,
            'services.fonnte.token' => '',
        ]);

        Http::fake([
            'https://satarya-erp.app.n8n.cloud/webhook/*' => Http::response(['message' => 'Not found'], 404),
            'https://satarya-erp.app.n8n.cloud/webhook-test/*' => Http::response(['message' => 'Test workflow started'], 200),
        ]);

        $response = $this->postJson(route('n8n.notify'), [
            'aksi' => 'Penambahan Data Baru',
            'modul' => 'Proyek Klien',
            'nama_item' => 'Pembangunan Gudang B',
        ]);

        $response->assertOk()
            ->assertJson([
                'ok' => true,
                'status' => 200,
                'n8n_ok' => true,
            ]);

        Http::assertSent(fn (Request $request): bool => str_starts_with($request->url(), $testUrl));
    }

    public function test_it_falls_back_to_get_when_n8n_webhook_is_registered_for_get(): void
    {
        Http::preventStrayRequests();

        $prodUrl = 'https://satarya-erp.app.n8n.cloud/webhook/2e639377-58a6-438d-9c4c-98ee82a6a47f';
        config([
            'services.n8n.webhook_url' => $prodUrl,
            'services.fonnte.token' => '',
        ]);

        Http::fake(function (Request $request) {
            if ($request->method() === 'POST') {
                return Http::response(['message' => 'This webhook is not registered for POST requests.'], 404);
            }

            return Http::response(['message' => 'Workflow was started'], 200);
        });

        $response = $this->postJson(route('n8n.notify'), [
            'aksi' => 'Penambahan Data Baru',
            'modul' => 'Proyek Klien',
            'nama_item' => 'Pembangunan Gudang C',
        ]);

        $response->assertOk()
            ->assertJson([
                'ok' => true,
                'status' => 200,
            ]);

        Http::assertSent(fn (Request $request): bool => $request->method() === 'GET' && str_starts_with($request->url(), $prodUrl));
    }

    public function test_it_also_dispatches_to_fonnte_when_fonnte_token_is_provided(): void
    {
        Http::preventStrayRequests();

        $prodUrl = 'https://satarya-erp.app.n8n.cloud/webhook/2e639377-58a6-438d-9c4c-98ee82a6a47f';
        config(['services.n8n.webhook_url' => $prodUrl]);

        Http::fake([
            'https://satarya-erp.app.n8n.cloud/webhook/*' => Http::response(['message' => 'Workflow was started'], 200),
            'https://api.fonnte.com/send' => Http::response(['status' => true, 'detail' => 'success! message in queue'], 200),
        ]);

        $response = $this->postJson(route('n8n.notify'), [
            'aksi' => 'Penambahan Data Baru',
            'modul' => 'Proyek Klien',
            'nama_item' => 'Renovasi Kantor Pusat',
            'fonnte_token' => 'KWQnYkfe2adikDbgw7sH',
            'fonnte_target' => '62882008084730',
        ]);

        $response->assertOk()
            ->assertJson([
                'ok' => true,
                'n8n_ok' => true,
                'fonnte_ok' => true,
            ]);

        Http::assertSent(fn (Request $request): bool => $request->url() === 'https://api.fonnte.com/send'
            && $request->hasHeader('Authorization', 'KWQnYkfe2adikDbgw7sH')
            && $request['target'] === '62882008084730');
    }

    public function test_it_validates_required_notification_fields(): void
    {
        $response = $this->postJson(route('n8n.notify'), []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['aksi', 'modul', 'nama_item']);
    }

    public function test_it_skips_notification_for_invoice_module(): void
    {
        Http::preventStrayRequests();

        $response = $this->postJson(route('n8n.notify'), [
            'aksi' => 'Penambahan Data Baru',
            'modul' => 'Invoice & Tagihan',
            'nama_item' => 'INV-202610-001',
            'divisi' => 'Renovasi Gedung A',
            'nilai' => 'Rp 50.000.000',
        ]);

        $response->assertOk()
            ->assertJson([
                'ok' => true,
                'skipped' => true,
            ]);

        Http::assertNothingSent();
    }
}
