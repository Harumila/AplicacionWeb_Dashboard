import { Routes } from '@angular/router';
import { userAuthGuard } from './core/guards/user-auth-guard'; // Asegúrate de que exista y esté bien escrito

import { AuthGuard } from './core/guards/admin-auth-guard';

export const routes: Routes = [
  // Redirección por defecto
  { path: '', redirectTo: '/admin/login', pathMatch: 'full' },

  // 🔐 RUTAS DE AUTENTICACIÓN DE USUARIOS (CLIENTES)

  // 👤 RUTA DE PERFIL (protegida con guard opcional)


      
   

           /*
      {
              path: 'producto/:id',
              loadComponent: () =>
                import('./features/user/product-detail/product-detail.component')
                  .then(m => m.ProductDetailComponent)
            },
            {
              path: 'carrito',
              loadComponent: () =>
                import('./features/user/cart/cart.component')
                  .then(m => m.CartComponent)
            },
            {
              path: 'checkout',
              loadComponent: () =>
                import('./features/user/checkout/checkout.component')
                  .then(m => m.CheckoutComponent),
              canActivate: [userAuthGuard]
            },
            {
              path: 'mi-cuenta',
              loadComponent: () =>
                import('./features/user/account/account.component')
                  .then(m => m.AccountComponent),
              canActivate: [userAuthGuard]
            },
            {
              path: 'mis-pedidos',
              loadComponent: () =>
                import('./features/user/orders/orders.component')
                  .then(m => m.OrdersComponent),
              canActivate: [userAuthGuard]
            } */
  


  // ⚙️ RUTAS DE ADMINISTRADOR
  {
    path: 'admin',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/admin/auth/admin-login/admin-login.component')
            .then(m => m.AdminLoginComponent)
      },
      
    // 🔐 Sección protegida
    {
      path: '',
      loadComponent: () =>
        import('./layout/admin-layout/admin-layout.component')
          .then(m => m.AdminLayoutComponent),
      canActivate: [AuthGuard], // 🔒 Aquí aplicamos el guard
      children: [
        {
          path: 'dashboard',
          loadComponent: () =>
            import('./features/admin/dashboard/dashboard.component')
              .then(m => m.DashboardComponent)
        },
        {
          path: 'mantenimiento/producto',
          loadComponent: () =>
            import('./features/admin/products/product-list/product-list.component')
              .then(m => m.ProductListComponent)
        },
        {
          path: 'mantenimiento/products/edit/:id',
          loadComponent: () =>
            import('./features/admin/products/product-edit/product-edit.component')
              .then(m => m.ProductEditComponent)
        },
        {
          path: 'mantenimiento/products/create',
          loadComponent: () =>
            import('./features/admin/products/product-create/product-create.component')
              .then(m => m.ProductCreateComponent)
        },
              {
          path: 'mantenimiento/categoria',
          loadComponent: () =>
            import('./features/admin/categoria/categoria.component')
              .then(m => m.CategoriaComponent)
        },
            {
          path: 'ventas/pedidos',
          loadComponent: () =>
            import('./features/admin/pedidos/pedidos.component')
              .then(m => m.PedidosComponent)
        },
     
{
  path: 'enivioAdmin',
  loadComponent: () =>
    import('./features/admin/envios/envios.component')
      .then(m => m.Envioscomponent)
}
,
{
  path: 'Estadisticas',
  loadComponent: () =>
    import('./features/admin/Estadisticas/Estadisticas.component')
      .then(m => m.EstadisticasComponent)
}
,

{
  path: 'roles',
  loadComponent: () =>
    import('./features/admin/roles/roles-list/roles-list.component')
      .then(m => m.RolesListComponent)
},
{
  path: 'roles/create',
  loadComponent: () =>
    import('./features/admin/roles/roles-create/roles-create.component')
      .then(m => m.RolesCreateComponent)
},
{
  path: 'usuarios',
  loadComponent: () =>
    import('./features/admin/usuarios/usuarios-list/usuarios-list.component')
      .then(m => m.UsuariosListComponent)
},
{
  path: 'usuarios/create',
  loadComponent: () =>
    import('./features/admin/usuarios/usuarios-create/usuarios-create.component')
      .then(m => m.UsuariosCreateComponent)
}
,

        // Redirección por defecto
        {
          path: '',
          redirectTo: 'dashboard',
          pathMatch: 'full'
        },



          
        ]
      }
    ]
  },

  // 🚫 RUTA 404 - Página no encontrada
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component')
        .then(m => m.NotFoundComponent)
  }
];
