export class Rule {
    private rules: Rule[] = [];
    private selectors: string[];

    public constructor(selectors: string[] | string, private style: React.CSSProperties) {
        this.selectors = Array.isArray(selectors) ? selectors : [selectors];
    }

    public addRule(selectors: string[] | string, style: React.CSSProperties = {}) {
        const rule = new Rule(selectors, style);
        this.rules.push(rule);
        return rule;
    }

    public addSelector(...selector: string[]) {
        this.selectors.push(...selector);
    }

    public setStyle(style: React.CSSProperties) {
        this.style = style;
    }

    public addToStylesheet(sheet: CSSStyleSheet, parentSelectors: string[] = [""]) {
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

export class Stylesheet {
    private rules: Rule[] = []

    public addRule(selectors: string[] | string, style: React.CSSProperties = {}) {
        const rule = new Rule(selectors, style);
        this.rules.push(rule);
        return rule;
    }

    public apply() {
        const style = document.createElement("style");
        document.head.appendChild(style);
        console.log(this.rules);
        for (const rule of this.rules) {
            rule.addToStylesheet(style.sheet!);
        }
    }
}