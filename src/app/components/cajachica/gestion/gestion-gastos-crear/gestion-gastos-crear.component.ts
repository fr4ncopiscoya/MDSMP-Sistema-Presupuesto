import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { CajachicaService } from 'src/app/services/cajachica.service';

@Component({
  selector: 'app-gestion-gastos-crear',
  templateUrl: './gestion-gastos-crear.component.html',
  styleUrls: ['./gestion-gastos-crear.component.css']
})
export class GestionGastosCrearComponent implements OnInit {

  @Output() gastoRegistrado = new EventEmitter<string>();

  // DATA TIPO DOC
  dataTipoDoc: any;
  dataRubro: any;
  dataArea: any;
  dataTipoDocIde: any;


  //Registrar
  ccd_id: number = 0;
  ccr_id: number = 0;
  ard_id: number = 0;
  tdi_id: string;



  constructor(
    private spinner: NgxSpinnerService,
    private cajachicaService: CajachicaService
  ) { }

  ngOnInit(): void {
    this.listarTipoDocumento()
    this.listarRubro()
    this.listarArea()
    this.listarTipoDocumentoIdentidad()
  }

  onSelectionChangeTipDocIde(event: any) {
    this.tdi_id = event.target.value
    console.log(this.tdi_id);
  }


  //============ LISTAR ====================

  listarTipoDocumentoIdentidad() {
    let post = {
    }

    this.spinner.show();
    this.cajachicaService.listarTipoDocumentoIdentidad(post).subscribe({
      next: (data: any) => {
        this.spinner.hide()
        this.dataTipoDocIde = data
      }
    })
  }

  listarTipoDocumento() {
    let post = {
    }

    this.spinner.show();
    this.cajachicaService.listarTipoDocumento(post).subscribe({
      next: (data: any) => {
        this.spinner.hide()
        this.dataTipoDoc = data
      }
    })
  }

  listarRubro() {
    let post = {
    }

    this.spinner.show();
    this.cajachicaService.listarRubro(post).subscribe({
      next: (data: any) => {
        this.spinner.hide()
        this.dataRubro = data
      }
    })
  }

  listarArea() {
    let post = {
    }

    this.spinner.show();
    this.cajachicaService.listarArea(post).subscribe({
      next: (data: any) => {
        this.spinner.hide()
        this.dataArea = data
      }
    })
  }
  
}
