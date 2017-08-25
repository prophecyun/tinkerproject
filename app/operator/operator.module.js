"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var platform_browser_1 = require('@angular/platform-browser');
var http_1 = require('@angular/http');
var material_1 = require('@angular/material');
var ng2_dragula_1 = require('ng2-dragula/ng2-dragula');
var forms_1 = require('@angular/forms');
var operator_layout_1 = require('./operator.layout');
var operator_control_component_1 = require('./operator.control.component');
var map_openlayer_service_1 = require('../services/map.openlayer.service');
var map_google_service_1 = require('../services/map.google.service');
var app_config_1 = require('../config/app.config');
var deployment_service_1 = require('../services/deployment.service');
var OperatorModule = (function () {
    function OperatorModule() {
    }
    OperatorModule = __decorate([
        core_1.NgModule({
            imports: [
                platform_browser_1.BrowserModule,
                http_1.HttpModule,
                material_1.MaterialModule.forRoot(),
                ng2_dragula_1.DragulaModule,
                forms_1.FormsModule
            ],
            declarations: [
                operator_layout_1.OperatorLayout,
                operator_control_component_1.OperatorControlComponent],
            exports: [],
            providers: [
                map_openlayer_service_1.OpenlayersMapService,
                app_config_1.AppConfigService,
                deployment_service_1.DeploymentService,
                map_google_service_1.GoogleMapService],
            bootstrap: [operator_layout_1.OperatorLayout]
        }), 
        __metadata('design:paramtypes', [])
    ], OperatorModule);
    return OperatorModule;
}());
exports.OperatorModule = OperatorModule;
//# sourceMappingURL=operator.module.js.map