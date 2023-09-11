import createButton from "./Components/Button";
import { Stylesheet } from "./Stylesheet";
import { GlideConfig } from "./types";

let glideCount = 0;

export const createGlide = <T extends string>(config: GlideConfig<T>) => {
    glideCount++;
    const style = new Stylesheet()
    const result = {
        Button: createButton(config.buttons, style.addRule(`.glide-${glideCount}-button`), `.glide-${glideCount}-button`)
    }
}