
const puppeteer = function (scriptName, isWithComment = false) {

    var _scriptName = scriptName || ""

    /** version 0.1 2009-04-30
     * @author      Andrea Giammarchi
     * @license     Mit Style License
     * @project     http://code.google.com/p/css2xpath/
     */
    css2xpath = (function () { var b = [/\[([^\]~\$\*\^\|\!]+)(=[^\]]+)?\]/g, "[@$1$2]", /\s*,\s*/g, "|", /\s*(\+|~|>)\s*/g, "$1", /([a-zA-Z0-9\_\-\*])~([a-zA-Z0-9\_\-\*])/g, "$1/following-sibling::$2", /([a-zA-Z0-9\_\-\*])\+([a-zA-Z0-9\_\-\*])/g, "$1/following-sibling::*[1]/self::$2", /([a-zA-Z0-9\_\-\*])>([a-zA-Z0-9\_\-\*])/g, "$1/$2", /\[([^=]+)=([^'|"][^\]]*)\]/g, "[$1='$2']", /(^|[^a-zA-Z0-9\_\-\*])(#|\.)([a-zA-Z0-9\_\-]+)/g, "$1*$2$3", /([\>\+\|\~\,\s])([a-zA-Z\*]+)/g, "$1//$2", /\s+\/\//g, "//", /([a-zA-Z0-9\_\-\*]+):first-child/g, "*[1]/self::$1", /([a-zA-Z0-9\_\-\*]+):last-child/g, "$1[not(following-sibling::*)]", /([a-zA-Z0-9\_\-\*]+):only-child/g, "*[last()=1]/self::$1", /([a-zA-Z0-9\_\-\*]+):empty/g, "$1[not(*) and not(normalize-space())]", /([a-zA-Z0-9\_\-\*]+):not\(([^\)]*)\)/g, function (f, e, d) { return e.concat("[not(", a(d).replace(/^[^\[]+\[([^\]]*)\].*$/g, "$1"), ")]") }, /([a-zA-Z0-9\_\-\*]+):nth-child\(([^\)]*)\)/g, function (f, e, d) { switch (d) { case "n": return e; case "even": return "*[position() mod 2=0 and position()>=0]/self::" + e; case "odd": return e + "[(count(preceding-sibling::*) + 1) mod 2=1]"; default: d = (d || "0").replace(/^([0-9]*)n.*?([0-9]*)$/, "$1+$2").split("+"); d[1] = d[1] || "0"; return "*[(position()-".concat(d[1], ") mod ", d[0], "=0 and position()>=", d[1], "]/self::", e) } }, /:contains\(([^\)]*)\)/g, function (e, d) { return "[contains(text(),'" + d + "')]" }, /\[([a-zA-Z0-9\_\-]+)\|=([^\]]+)\]/g, "[@$1=$2 or starts-with(@$1,concat($2,'-'))]", /\[([a-zA-Z0-9\_\-]+)\*=([^\]]+)\]/g, "[contains(@$1,$2)]", /\[([a-zA-Z0-9\_\-]+)~=([^\]]+)\]/g, "[contains(concat(' ',normalize-space(@$1),' '),concat(' ',$2,' '))]", /\[([a-zA-Z0-9\_\-]+)\^=([^\]]+)\]/g, "[starts-with(@$1,$2)]", /\[([a-zA-Z0-9\_\-]+)\$=([^\]]+)\]/g, function (f, e, d) { return "[substring(@".concat(e, ",string-length(@", e, ")-", d.length - 3, ")=", d, "]") }, /\[([a-zA-Z0-9\_\-]+)\!=([^\]]+)\]/g, "[not(@$1) or @$1!=$2]", /#([a-zA-Z0-9\_\-]+)/g, "[@id='$1']", /\.([a-zA-Z0-9\_\-]+)/g, "[contains(concat(' ',normalize-space(@class),' '),' $1 ')]", /\]\[([^\]]+)/g, " and ($1)"], c = b.length; return function a(e) { var d = 0; while (d < c) { e = e.replace(b[d++], b[d++]) } return "//" + e } })();

    let commandCnt = 0;
    let waitCnt = 0;

    const locatorType = {

        xpath: (target) => {
            return target
        },
        css: (target) => {
            return css2xpath(target)
        },
        absoluteCSS: (target) => {
            return css2xpath(target)
        },
        id: (target) => {
            return "//*[@id=\"" + target + "\"]";
        },
        link: (target) => {
            let offset = 0;
            if (target.substring(0, 6) == 'exact:') {
                offset = 6
            }
            return "//a[contains(text(),'" + target.substring(offset, target.length) + "')]";
        },
        name: (target) => {
            return "//*[@name=\"" + target + "\"]";
        },

        // tag_name: (target) => {
        //     return `By.tagName("${target.replace(/\"/g, "\'")}")`
        // }

    }

    function locator(target) {

        if (target.substring(0, 1) === "/" || target.substring(0, 2) === "//") {
            return target;
        }

        let locType = target.split("=", 1)
        let selectorStr = target.substr(target.indexOf("=") + 1, target.length)
        let locatorFunc = locatorType[locType]
        if (typeof (locatorFunc) == 'undefined') {
            // return `By.xpath("${target.replace(/\"/g, "\'")}")`
            // return 'not defined'
            return target
        }

        return locatorFunc(selectorStr)

    }


    // built in selenium vars
    // https://github.com/Jongkeun/selenium-ide/blob/6d18a36991a9541ab3e9cad50c2023b0680e497b/packages/selenium-ide/src/content/selenium-api.js
    // https://github.com/GoogleChrome/puppeteer/blob/master/lib/USKeyboardLayout.js
    let keyDictionary = {
        '${KEY_LEFT}': 'ArrowLeft',
        '${KEY_UP}': 'ArrowUp',
        '${KEY_RIGHT}': 'ArrowRight',
        '${KEY_DOWN}': 'ArrowDown',
        '${KEY_PGUP}': 'PageUp',
        '${KEY_PAGE_UP}': 'PageUp',
        '${KEY_PGDN}': 'PageDown',
        '${KEY_PAGE_DOWN}': 'PageDown',
        '${KEY_BKSP}': 'Backspace',
        '${KEY_BACKSPACE}': 'Backspace',
        '${KEY_DEL}': 'Delete',
        '${KEY_DELETE}': 'Delete',
        '${KEY_ENTER}': 'Enter',
        '${KEY_TAB}': 'Tab',
        '${KEY_HOME}': 'Home'
    };

    function puppeteerReplaceAll(inputString, str1, str2, ignore) {
        return inputString.replace(
            new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"),
                (ignore ? "gi" : "g")),
            (typeof (str2) == "string") ? str2.replace(/\$/g, "$$$$") : str2
        );
    }

    function seleniumKeyVars(originalValue) {
        let modifiedValue = originalValue;


        console.log("originalValue", originalValue);
        // loop over all selenium vars and replace all instances with the value in keyDictionary
        Object.keys(keyDictionary).forEach(key =>
            modifiedValue = puppeteerReplaceAll(modifiedValue, key, keyDictionary[key])
        );

        console.log("modifiedValue", modifiedValue);

        return modifiedValue;
    }


    // NR Synthetics
    // https://docs.newrelic.com/docs/synthetics/new-relic-synthetics/scripting-monitors/synthetics-scripted-browser-reference-monitor-versions-050#browser-waitForAndFindElement
    // katalon
    // https://docs.katalon.com/katalon-recorder/docs/selenese-selenium-ide-commands-reference.html
    const seleneseCommands = {
        open: (x) => `await helper.open(page, \`${locator(x.target)}\`, \`networkidle0\`);`, // open: (x) => `await page.goto(\`${locator(x.target)}\`, { waitUntil: 'networkidle0' });`,
        doubleclick: (x) => `element = await page.$x(\`${locator(x.target)}\`);\n\tawait element[0].click({ clickCount: 2 });`,
        click: (x) => `await helper.click(page, \`${locator(x.target)}\`, \`[W#${waitCnt}]\`, waitNotNeeded, true);`, // click: (x) => `element = await page.$x(\`${locator(x.target)}\`);\n\tawait element[0].click();`,
        store: (x) => `await let ${locator(x.target)} = ${x.value};`,
        type: (x) => `await helper.type(page, \`${locator(x.target)}\`, \`${x.value}\`);`, // type: (x) => `element = await page.$x(\`${locator(x.target)}\`);\n\tawait element[0].type(\`${x.value}\`);`,
        pause: (x) => `await page.waitFor(parseInt('${locator(x.target)}'));`,
        mouseover: (x) => `await page.hover(\`${locator(x.target)}\`);`,
        deleteallvisiblecookies: (x) => `await page.deleteCookie(await page.cookies());`,
        capturescreenshot: (x) => `await page.screenshot({ path: \`${locator(x.target || "screenshot")}.jpg\` });`,
        captureentirepagescreenshot: (x) => `await page.screenshot({ path: \`${locator(x.target || "screenshot")}.jpg\`, fullPage: true });`,
        bringbrowsertoforeground: (x) => `await page.bringToFront();`,
        refresh: (x) => `await page.reload();`,
        echo: (x) => `await helper.hover(page, \`${locator(x.target)}\`);`, // echo: (x) => `let [ele] = await page.$x(\`${locator(x.target)}\`)\n\tawait ele.hover();`, // echo: (x) => `console.log(\`${locator(x.target)}\`, \`${x.value}\`);`,
        get: (x) => `await page.goto(\`${locator(x.target)}\`);`,
        comment: (x) => `// ${locator(x.target)}`,
        submit: (x) => `await helper.submit(page, \`${locator(x.target)}\`, \`[W#${waitCnt}]\`, waitNotNeeded, true);`, // submit: (x) => `formElement = await page.$x(\`${locator(x.target)}\`);\n\tawait page.evaluate(form => form.submit(), formElement[0]);\n\tawait page.waitForNavigation();`,
        sendkeys: (x) => `await helper.sendKeys(page, \`${seleniumKeyVars(x.value)}\`, \`[W#${waitCnt}]\`, waitNotNeeded, true);`, // sendkeys: (x) => `await page.keyboard.press(\`${seleniumKeyVars(x.value)}\`)`,
        selectframe: (x) => `var frames = await page.frames();\n\tvar newFrame = await frames.find(f => f.name() === \`${x.target}\`);`,
        selectwindow: (x) => `tabs = await browser.pages();\n\tconsole.log(tabs);`,
        verifyelementpresent: (x) => `await helper.verifyElementPresent(page, \`${locator(x.target)}\`, verifyFailed, output, ${commandCnt});`, // verifyelementpresent: (x) => `if (await page.$(\`${locator(x.target)}\`) !== null) { if (output) console.log("verifyElementPresent PASSED [C#${commandCnt}]."); } else { verifyFailed.push("[C#${commandCnt}]"); }`,
        assertelementpresent: (x) => `await helper.assertElementPresent(browser, page, \`${locator(x.target)}\`, output, ${commandCnt});`, // assertelementpresent: (x) => `if (await page.$(\`${locator(x.target)}\`) !== null) { if (output) console.log("assertElementPresent PASSED [C#${commandCnt}]."); } else { await browser.close(); throw "assertElementPresent FAILED [C#${commandCnt}]. Element not found."; }`,
        waitforpagetoload: (x) => `await page.waitForFunction(() => { while (document.readyState !== 'complete'); return true; });`,
        waitforvisible: (x) => `await helper.waitForVisible(page, \`${locator(x.target)}\`);`, // waitforvisible: (x) => `await page.waitForXPath(\`${locator(x.target)}\`, { visible: true });`,
        waitforelementpresent: (x) => `await page.waitForXPath(\`${locator(x.target)}\`);`,
        verifytitle: (x) => `await helper.verifyTitle(page, \`${x.target}\`, verifyFailed, output, ${commandCnt});`, // verifytitle: (x) => `if (await page.title() == \`${x.target}\`) { if (output) console.log("verifyTitle PASSED [C#${commandCnt}]."); } else { verifyFailed.push("[C#${commandCnt}]"); }`,
        asserttitle: (x) => `await helper.assertTitle(browser, page, \`${x.target}\`, output, ${commandCnt});`, // asserttitle: (x) => `if (await page.title() == \`${x.target}\`) { if (output) console.log("assertTitle PASSED [C#${commandCnt}]."); } else { await browser.close(); throw "assertTitle FAILED [C#${commandCnt}]. Title not matching."; }`,
        verifytext: (x) => `await helper.verifyText(page, \`${locator(x.target)}\`, \`${x.value}\`, verifyFailed, output, ${commandCnt});`, // verifytext: (x) => `var [e] = await page.$x(\`${locator(x.target)}\`);\n\tif (await e.evaluate(el => el.innerText) == \`${x.value}\`) { if (output) console.log("verifyText PASSED [C#${commandCnt}]."); } else { verifyFailed.push("[C#${commandCnt}]"); }`,
        asserttext: (x) => `await helper.assertText(browser, page, \`${locator(x.target)}\`, \`${x.value}\`, output, ${commandCnt});`, // asserttext: (x) => `var [e] = await page.$x(\`${locator(x.target)}\`);\n\tif (await e.evaluate(el => el.innerText) == \`${x.value}\`) { if (output) console.log("assertText PASSED [C#${commandCnt}]."); } else { await browser.close(); throw "assertText FAILED [C#${commandCnt}]. Text not matching."; }`,
        verifyvalue: (x) => `await helper.verifyValue(page, \`${locator(x.target)}\`, \`${x.value}\`, verifyFailed, output, ${commandCnt});`, // verifyvalue: (x) => `var [e] = await page.$x(\`${locator(x.target)}\`);\n\tif (await e.evaluate(el => el.value) == \`${x.value}\`) { if (output) console.log("verifyValue PASSED [C#${commandCnt}]."); } else { verifyFailed.push("[C#${commandCnt}]"); }`,
        assertvalue: (x) => `await helper.assertValue(browser, page, \`${locator(x.target)}\`, \`${x.value}\`, output, ${commandCnt});`, // assertvalue: (x) => `var [e] = await page.$x(\`${locator(x.target)}\`);\n\tif (await e.evaluate(el => el.value) == \`${x.value}\`) { if (output) console.log("assertValue PASSED [C#${commandCnt}]."); } else { await browser.close(); throw "assertValue FAILED [C#${commandCnt}]. Value not matching."; }`,
    };

    /**
     * Automatically adds "waitForNavigation" if the command needs it
     * @param {{command: string, target: string, value: string}} command
     * @return string}
     */
    function waitForNavigationIfNeeded(command) {
        if (command.target.toLowerCase().startsWith("link=")){ 
            // It's a link, the page is probably going to change
            return `\n\tawait page.waitForNavigation();`;
        }

        return "";
    }

    const header =
        "// Script Name: {_SCRIPT_NAME_}\n\n" +
        "const helper = require('../helpers/helper');\n" +
        "const puppeteer = require('puppeteer');\n\n" +
        "const puppetTest = async (output) => {\n" +
        "const EXTENSION_REQUIRED = false;\n" + // default value of false since we assume that the majority of tests are not extension based
        "const EXTENSION_PATH = '../fe-browser-extentions/dist'\n" +
        "let args = ['--start-maximized']\n" +
        "if (EXTENSION_REQUIRED) args.push(...[`--disable-extensions-except=${EXTENSION_PATH}`, `--load-extension=${EXTENSION_PATH}`])\n" +
        "let browser = await puppeteer.launch({ headless: false, defaultViewport: { width: 1920, height: 1080 }, args: args});\n\n" +
        "const page = await browser.newPage();\n" +
        "await page.setDefaultNavigationTimeout(5000);\n" +
        "let waitNotNeeded = [];\n" +
        "let verifyFailed = [];\n\n"

    const footer =
        "await browser.close();\n" +
        "return [waitNotNeeded, verifyFailed];\n" +
        "}\n" +
        "module.exports = puppetTest;"


    function formatter(commands) {

        return header.replace(/_SCRIPT_NAME_/g, _scriptName) +
            commandExports(commands).content +
            footer +
            funcExports()


    }

    function commandExports(commands) {
        let output = commands.reduce((accObj, commandObj) => {
            let { command, target, value } = commandObj

            let cmd = seleneseCommands[command.toLowerCase()]
            if (typeof (cmd) == "undefined") {
                accObj.content += `\n\n\t// WARNING: unsupported command ${command}. Object= ${JSON.stringify(commandObj)}\n\n`
                return accObj
            }

            let cmdString = cmd(commandObj)

            if (typeof (accObj) == "undefined") {
                accObj = { step: 1, content: "" }
            }

            accObj.step += 1
            if (isWithComment) {
                let oldCommand = `Command: ${command}, Target: ${target}, Value: ${value}`
                accObj.content +=
                    `// Original Katalon Recorder info - ${oldCommand}\n`
            }
            

            let modifiedOutput = "";
            let waitCommands = ['click', 'sendkeys', 'submit'];
            if (waitCommands.includes(command.toLowerCase())) waitCnt++;
            modifiedOutput = `//[C#${commandCnt}]\n${cmdString}`;
            commandCnt++;
            
            accObj.content += `${modifiedOutput}\n\n`
            return accObj
        }, { step: 1, content: "" })


        return output
    }

    function funcExports() {
        let funcs = ''
        return funcs
    }

    return {
        formatter,
        commandExports,
        funcExports,
        locator,
        seleneseCommands,
        locatorType,
        specialKeyMap: keyDictionary
    }

}



newFormatters.puppeteer = function (name, commands) {
    return {
        content: puppeteer(name).formatter(commands),
        extension: 'js',
        mimetype: 'application/javascript'
    }
}

newFormatters.puppeteer_w_comment = function (name, commands) {
    return {
        content: puppeteer(name, true).formatter(commands),
        extension: 'js',
        mimetype: 'application/javascript'
    }
}

newFormatters.puppeteer_json = function (name, commands) {
    return {
        content: JSON.stringify(commands),
        extension: 'json',
        mimetype: 'application/ld-json'
    }
}
