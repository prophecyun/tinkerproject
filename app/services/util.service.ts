import { Injectable } from '@angular/core'

@Injectable()
// Service to request incidents & updates from server
export class UtilService {

    getOrgLogo(organisation: string): string {
        if (organisation === "SCDF HQ" || organisation === "scdf HQ") {
            return "img/unitlogo/scdf logo.jpg";
        } else if (organisation === "SPF HQ" || organisation === "spf HQ") {
            return "img/unitlogo/spf logo.jpg";
        } else if (organisation === "MOT HQ" || organisation === "mot HQ") {
            return "img/unitlogo/mot logo.jpg";
        } else if (organisation === "MOT" || organisation === "mot") {
            return "img/unitlogo/mot logo.jpg";
        } else if (organisation === "MHA HQ" || organisation === "mha HQ") {
            return "img/unitlogo/mha logo.jpg";
        } else if (organisation === "MHA HCCC" || organisation === "mha hccc") {
            return "img/unitlogo/mha logo.jpg";
        } else if (organisation === "MOH HQ" || organisation === "moh HQ") {
            return "img/unitlogo/MOH logo.jpg";
        } else {
            return "img/unitlogo/no logo.jpg";
        }
    }

    isJsonEmpty(obj: any): boolean {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }
        return true;
    }
}