abstract class Rule {
    protected rules: Rule[] = [];
    protected selectors: string[];

    protected constructor(selectors: string[] | string) {
        this.selectors = Array.isArray(selectors) ? selectors : [selectors];
    }

    public abstract addToStylesheet(sheet: CSSStyleSheet | CSSMediaRule, parentSelectors?: string[]): void;

    public addRule(selectors: string[] | string, style: React.CSSProperties = {}) {
        const rule = new StyleRule(selectors, style);
        this.rules.push(rule);
        return rule;
    }
    
    public addSelector(...selector: string[]) {
        this.selectors.push(...selector);
    }
}
export class StyleRule extends Rule {

    public constructor(selectors: string[] | string, private style: React.CSSProperties) {
        super(selectors);
    }

    public setStyle(style: React.CSSProperties) {
        this.style = style;
    }

    public addToStylesheet(sheet: CSSStyleSheet | CSSMediaRule, parentSelectors: string[] = [""]) {
        const combinedSelectors = parentSelectors.map(parentSelector => this.selectors
            .map(selector => selector[0] === "&" ? parentSelector + selector.substring(1) : `${parentSelector} ${selector}`)
        ).flat()
        const properties = Object.entries(this.style).map(([key, value]) => `\n  ${key.replace(/[A-Z]/g, value => `-${value.toLowerCase()}`)}: ${value};`)
        if (properties.length > 0) {
            sheet.insertRule(`${combinedSelectors.join(", ")} {${properties.join("")}\n}`, sheet.cssRules.length)
        }
        for (const rule of this.rules) {
            rule.addToStylesheet(sheet, combinedSelectors);
        }
    }
}

export class MediaRule extends Rule {
    public constructor(expressions: {
        width: number,
        mode: "min" | "max"
    }[]) {
        super(expressions.map(expression => `(${expression.mode}-width: ${expression.width}px)`));
    }

    public addToStylesheet(sheet: CSSStyleSheet | CSSMediaRule, parentSelectors?: string[] | undefined): void {
        if (parentSelectors !== undefined) throw new Error("Media rules cannot be nested");
        const index = sheet.insertRule(`@media screen and ${this.selectors.join(' and ')} {}`, sheet.cssRules.length);
        const mediaRule = sheet.cssRules[index] as CSSMediaRule;
        for (const childRule of this.rules) {
            childRule.addToStylesheet(mediaRule);
        }
    }
}

export class Stylesheet {
    private rules: Rule[] = [];

    public addRule(selectors: string[] | string, style: React.CSSProperties = {}) {
        const rule = new StyleRule(selectors, style);
        this.rules.push(rule);
        return rule;
    }

    public addMediaRule(expressions: {
        width: number,
        mode: "min" | "max"
    }[]) {
        const rule = new MediaRule(expressions);
        this.rules.push(rule);
        return rule;
    }

    public apply(debug: boolean = false) {
        const style = document.createElement("style");
        document.head.appendChild(style);
        if (debug) {
            console.log("CSS Stylesheet:", style.sheet);
            console.log("Rules in this stylesheet:", this.rules);
        }
        for (const rule of this.rules) {
            rule.addToStylesheet(style.sheet!);
        }
    }
}