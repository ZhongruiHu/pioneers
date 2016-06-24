type Possibility = [string, string];
interface TogglerOptions {
    selector: string;
    ops: Array<Possibility>;
    callback: (p: Possibility) => void;
}

class Toggler {
    private element: any; // Zepto.
    private ops: Array<Possibility>;
    private callback: (p: Possibility) => void;

    constructor(options: TogglerOptions) {
        this.element = $(options.selector);
        this.ops = options.ops;
        this.callback = options.callback;
    }

    public draw() {
        this.ops.forEach((p: Possibility, i: number) => {
            let link = $(`<a href="#" data-val="${p[1]}" title="${p[0]}">${p[0]}</a>`);

            if (i == 0) {
                link.addClass("selected");
            }

            link.click((e:Event) => {
                e.preventDefault();

                let selected = $(e.target);
                this.setTo(selected.data("val"), true);
            });

            this.element.append(link);
        });
    }

    public get(): Possibility {
        let e = this.element.find("a.selected")[0];

        if (e) {
            return [e.text(), e.data("val")];
        }
    }

    public setTo(v: string, triggerCallback = false): boolean {
        let e = this.element.find(`a[data-val='${v}']`);

        if (!e) {
            return false;
        } else {
            console.log(e.text());

            if (triggerCallback) { this.callback([e.text(), e.data("val")]); }

            return true;
        }
    }
}
