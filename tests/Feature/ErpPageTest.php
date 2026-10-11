<?php

namespace Tests\Feature;

use Tests\TestCase;

class ErpPageTest extends TestCase
{
    public function test_erp_page_renders_app_shell(): void
    {
        $response = $this->get(route('erp'));

        $response->assertOk();
        $response->assertSee('<title>Sistem Manajemen Operasional</title>', false);
        $response->assertSee('<aside id="side"></aside>', false);
        $response->assertSee('<main id="main"></main>', false);
        $response->assertSee('<dialog id="dlg"></dialog>', false);
        $response->assertSee(asset('css/erp.css'), false);
        $response->assertSee(asset('js/erp.js'), false);
    }

    public function test_erp_static_assets_exist(): void
    {
        $this->assertFileExists(public_path('css/erp.css'));
        $this->assertFileExists(public_path('js/erp.js'));
    }
}
