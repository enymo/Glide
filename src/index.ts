import createButton from "./Components/Button";
import createInput from "./Components/Input";
import { Stylesheet } from "./Stylesheet";
import { GlideConfig } from "./types";

let glideCount = 0;

export const createGlide = <T extends string, U extends string>(config: GlideConfig<T, U>) => {
    glideCount++;
    const style = new Stylesheet()
    const result = {
        Button: createButton(config.buttons, style.addRule(`.glide-${glideCount}-button`), `glide-${glideCount}-button`),
        Input: createInput(config.inputs, style.addRule(`.glide-${glideCount}-input`), `glide-${glideCount}-input`),
    }
    style.apply();
    return result;
}