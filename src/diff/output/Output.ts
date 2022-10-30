import { CloudAssemblyResult } from "../result/ComparisonResult";
import * as fs from 'fs';
import * as yaml from 'yaml';
import { ComparisonResultFormatter } from "../result/ComparisonResultFormatter";

type Format = 'json' | 'yaml' | 'text'

export class Output {

    output(templates: CloudAssemblyResult[], format: Format, path?: string){

        let output = undefined;
        if(format == 'text'){
            output = this.toText(templates);
        } else if(format == 'yaml'){
            output = this.toYaml(templates);
        } else {
            output = this.toJson(templates);
        }

        if(path){
            fs.writeFileSync(path, output);
        } else {
            console.log(output);
        }
    }

    toJson(templates: CloudAssemblyResult[]) {
        return JSON.stringify(templates, null, 4);
    }

    toYaml(templates: CloudAssemblyResult[]) {
        return yaml.stringify(templates);
    }

    toText(templates: CloudAssemblyResult[]) {
        return ComparisonResultFormatter.format(templates);
    }

    

}