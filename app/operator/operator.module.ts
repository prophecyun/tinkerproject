import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { HttpModule } from '@angular/http'
import { MaterialModule } from '@angular/material'
import { DragulaModule } from 'ng2-dragula/ng2-dragula'
import { FormsModule} from '@angular/forms'

import { OperatorLayout } from './operator.layout'
import { OperatorControlComponent } from './operator.control.component'

import { OpenlayersMapService } from '../services/map.openlayer.service'
import { GoogleMapService } from '../services/map.google.service'
import { AppConfigService } from '../config/app.config';
import { DeploymentService } from '../services/deployment.service';


@NgModule({

    imports: [
        BrowserModule,
        HttpModule,
        MaterialModule.forRoot(),
        DragulaModule,
        FormsModule
    ],
    
    declarations: [
        OperatorLayout, 
        OperatorControlComponent],
    
    exports: [],

    providers: [
        OpenlayersMapService,
        AppConfigService,
        DeploymentService,
        GoogleMapService],

    bootstrap: [OperatorLayout]
})
export class OperatorModule { }