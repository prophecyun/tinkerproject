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
var app_config_1 = require('../config/app.config');
var DeploymentService = (function () {
    function DeploymentService(config) {
        this.config = config;
    }
    DeploymentService.prototype.loadSampleDeployment = function () {
        var deployment = [
            {
                "name": "Tues CP",
                "description": "",
                "icons": [
                    "../../img/unitlogo/ICA logo.jpg",
                    "",
                    ""
                ],
                "location": {
                    "lon": 103.635271,
                    "lat": 1.349856
                },
                "redcon": "1",
                "status": ""
            },
            {
                "name": "Woodlands CP",
                "description": "",
                "icons": [
                    "../../img/unitlogo/ICA logo.jpg",
                    "",
                    ""
                ],
                "location": {
                    "lon": 103.7682596,
                    "lat": 1.4439197
                },
                "redcon": "1",
                "status": ""
            },
            {
                "name": "SCA",
                "description": "",
                "icons": [
                    "../../img/unitlogo/spf logo.jpg",
                    "",
                    ""
                ],
                "location": {
                    "lon": 103.9884943,
                    "lat": 1.3628704
                },
                "redcon": "1",
                "status": ""
            },
            {
                "name": "PICP",
                "description": "",
                "icons": [
                    "../../img/unitlogo/spf logo.jpg",
                    "",
                    ""
                ],
                "location": {
                    "lon": 103.8430623,
                    "lat": 1.3241264
                },
                "redcon": "1",
                "status": ""
            },
            {
                "name": "Clementi Camp",
                "description": "",
                "icons": [
                    "../../img/unitlogo/no logo.jpg",
                    "",
                    ""
                ],
                "location": {
                    "lon": 103.7536567,
                    "lat": 1.3292526
                },
                "redcon": "1",
                "status": ""
            }
        ];
        return deployment;
    };
    DeploymentService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [app_config_1.AppConfigService])
    ], DeploymentService);
    return DeploymentService;
}());
exports.DeploymentService = DeploymentService;
//# sourceMappingURL=deployment.service.js.map