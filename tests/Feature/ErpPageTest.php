<?php

namespace Tests\Feature;

use Tests\TestCase;

class ErpPageTest extends TestCase
{
    public function test_erp_page_renders_app_shell(): void
    {
        $response = $this->get(route('erp'));

        $response->assertOk();
        $response->assertSee('<title>Satarya ERP — Ocean Workspace</title>', false);
        $response->assertSee('<header id="top" class="top"></header>', false);
        $response->assertSee('<main id="main" class="main"></main>', false);
        $response->assertSee('<dialog id="dlg" class="sheet"></dialog>', false);
        $response->assertSee('css/erp.css', false);
        $response->assertSee('js/erp.js', false);
    }

    public function test_erp_static_assets_exist(): void
    {
        $this->assertFileExists(public_path('css/erp.css'));
        $this->assertFileExists(public_path('js/erp.js'));
    }
}
