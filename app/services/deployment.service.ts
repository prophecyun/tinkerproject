import { Injectable } from '@angular/core'
import { AppConfigService } from '../config/app.config';


@Injectable()
// Service to request deployment & updates from server
export class DeploymentService {
    constructor(private config: AppConfigService) { }

    loadSampleDeployment(): any {
        let deployment = [
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

    }
}