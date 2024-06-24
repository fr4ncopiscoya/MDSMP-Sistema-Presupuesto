import { NgModule, Injectable, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ROUTES } from './app.routes';
import { Socket } from 'ngx-socket-io';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerModule } from "ngx-spinner";
import { DataTablesModule } from "angular-datatables";
import { DataTableDirective } from 'angular-datatables';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from "ngx-bootstrap/modal";
import { TreeviewModule } from 'ngx-treeview';
import { TypeaheadModule } from "ngx-bootstrap/typeahead";
import { LoginGuard } from './guards/login.guard';
import { InputMaskModule } from '@ngneat/input-mask';
import { LoginComponent } from './pages/login/login.component';
import { ToastComponent } from './components/toast/toast.component';
import { MenuComponent } from './components/menu/menu.component';
import { GestionCajachicaComponent } from './pages/cajachica-gestion/gestion-cajachica/gestion-cajachica.component';
import { GestionCajachicaValesComponent } from './pages/cajachica-gestion/gestion-cajachica-vales/gestion-cajachica-vales.component';
import { GestionCajachicaGastosComponent } from './pages/cajachica-gestion/gestion-cajachica-gastos/gestion-cajachica-gastos.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { GestionValesCrearComponent } from './components/cajachica/gestion/gestion-vales-crear/gestion-vales-crear.component';
import { GestionGastosCrearComponent } from './components/cajachica/gestion/gestion-gastos-crear/gestion-gastos-crear.component';
import { GestionPeriodosListarComponent } from './components/cajachica/gestion/gestion-periodos-listar/gestion-periodos-listar.component';
import { GestionPeriodosCrearComponent } from './components/cajachica/gestion/gestion-periodos-crear/gestion-periodos-crear.component';
import { GestionCajachicaCrearComponent } from './components/cajachica/gestion/gestion-cajachica-crear/gestion-cajachica-crear.component';

@NgModule({
  declarations: [
    ToastComponent,
    AppComponent,
    DashboardComponent,
    LoginComponent,
    MenuComponent,
    GestionCajachicaComponent,
    GestionCajachicaValesComponent,
    GestionCajachicaGastosComponent,
    NavbarComponent,
    GestionValesCrearComponent,
    GestionGastosCrearComponent,
    GestionPeriodosListarComponent,
    GestionPeriodosCrearComponent,
    GestionCajachicaCrearComponent,
  ],
  imports: [
    InputMaskModule.forRoot({ inputSelector: 'input', isAsync: true }),
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgxDropzoneModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    NgSelectModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    DataTablesModule,
    TooltipModule.forRoot(),
    TypeaheadModule.forRoot(),
    ModalModule.forRoot(),
    TreeviewModule.forRoot(),
    RouterModule.forRoot(ROUTES),
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  providers: [
    ToastComponent,
    DataTableDirective,
    TooltipModule,
    LoginComponent,
    LoginGuard,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
