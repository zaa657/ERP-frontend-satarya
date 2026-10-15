<?php

namespace Tests\Feature;

use Tests\TestCase;

class ErpPageTest extends TestCase
{
    public function test_erp_page_renders_app_shell(): void
    {
        $response = $this->get(route('erp'));

        $response->assertOk();
        $response->assertSee('<title>Satarya ERP — Integrated Workspace</title>', false);
        $response->assertSee('<header id="top" class="top"></header>', false);
        $response->assertSee('<main id="main" class="main"></main>', false);
        $response->assertSee('<dialog id="dlg" class="sheet"></dialog>', false);
        $response->assertSee('css/erp.css', false);
        $response->assertSee('js/erp.js', false);
    }

    public function test_erp_static_assets_exist(): void
    {
        $this->assertFileExists(public_path('css/base.css'));
        $this->assertFileExists(public_path('css/layout.css'));
        $this->assertFileExists(public_path('css/components.css'));
        $this->assertFileExists(public_path('css/auth.css'));
        $this->assertFileExists(public_path('css/export.css'));
        $this->assertFileExists(public_path('css/responsive.css'));
        $this->assertFileExists(public_path('css/erp.css'));

        $this->assertFileExists(public_path('js/schema.js'));
        $this->assertFileExists(public_path('js/state.js'));
        $this->assertFileExists(public_path('js/auth.js'));
        $this->assertFileExists(public_path('js/ui.js'));
        $this->assertFileExists(public_path('js/pages.js'));
        $this->assertFileExists(public_path('js/export.js'));
        $this->assertFileExists(public_path('js/erp.js'));
    }

    public function test_owner_portal_route(): void
    {
        $response = $this->get(route('login.owner'));

        $response->assertOk();
        $response->assertSee('"owner"', false);
    }

    public function test_admin_portal_route(): void
    {
        $response = $this->get(route('login.admin'));

        $response->assertOk();
        $response->assertSee('"admin"', false);
    }
}
