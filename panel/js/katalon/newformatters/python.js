newFormatters.python = function(name, commands) {
  let content = newPython(name).formatter(commands);
  return {
    content: content,
    extension: "py",
    mimetype: "text/plain",
  };
};

const newPython = function (scriptName) {
  let _scriptName = scriptName || "";

  // Locator conversion
  const locatorType = {
    xpath: (target) => {
      return `find_element_by_xpath('${target.replace(/'/g, "\\'")}')`;
    },
    name: (target) => {
      return `find_element_by_name('${target.replace(/'/g, "\\'")}')`;
    // },
    // css: (target) => {
    //   return `'${target.replace(/"/g, "'")}'`;
    // },
    // id: (target) => {
    //   return `'#${target.replace(/"/g, "'")}'`;
    }
  };

  // Selenese command conversion
  const seleneseCommands = {
    open: "driver.get('_TARGET_')",
    click: "driver.execute_script('arguments[0].click();', driver._BY_LOCATOR_)",
    type: "driver._BY_LOCATOR_.send_keys('_VALUE_')",
    pause: "time.sleep(_VALUE_/1000)"
  };

  const header =
    "# BEGIN\n" +
    "from selenium import webdriver\n" +
    "from selenium.webdriver.common.keys import Keys\n" +
    "from selenium.webdriver.common.desired_capabilities import DesiredCapabilities\n" +
    "from selenium.common.exceptions import TimeoutException\n" +
    "from selenium.webdriver.support.ui import WebDriverWait\n" +
    "from selenium.webdriver.support import expected_conditions as EC\n" +
    "import time\n\n" +
    "def _SCRIPT_NAME_(driver):\n";

  const footer = "# END";

  // Formats entire document
  function formatter(commands) {
    return (
      header.replace(/_SCRIPT_NAME_/g, _scriptName) +
      commandExports(commands).content +
      footer
    );
  }

  // Function conversion function
  function commandExports(commands) {
    return commands.reduce(
      (accObj, commandObj) => {
        let { command, target, value } = commandObj;
        let cmd = seleneseCommands[command];

        if (typeof cmd == "undefined") {
          accObj.content +=
            "\n\n\t# WARNING: unsupported command ${command}. Object= ${JSON.stringify(commandObj)}\n\n";
          return accObj;
        }

        let funcStr = cmd;

        if (typeof accObj == "undefined") {
          accObj = { content: "" };
        }

        let targetStr = target.trim().replace(/'/g, "\\'").replace(/"/g, '\\"');
        let valueStr = value.trim().replace(/'/g, "\\'").replace(/"/g, '\\"');
        let selectOption = value.trim().split("=", 2)[1];
        let locatorStr = locator(target);

        funcStr = funcStr
          .replace(/_STEP_/g, accObj.step)
          .replace(/_TARGET_STR_/g, targetStr)
          .replace(/_BY_LOCATOR_/g, locatorStr)
          .replace(/_TARGET_/g, target)
          //.replace(/_SEND_KEY_/g, specialKeyMap[value])
          .replace(/_VALUE_STR_/g, valueStr)
          .replace(/_VALUE_/g, value)
          .replace(/_SELECT_OPTION_/g, selectOption);

        accObj.step += 1;
        accObj.content += `\t${funcStr}\n`;

        return accObj;
      },
      { step: 1, content: "" }
    );
  }

  // Convert locator to selenium locator
  function locator(target) {
    let locType = target.split("=", 1);
    let selectorStr = target.substr(target.indexOf("=") + 1, target.length);
    let locatorFunc = locatorType[locType];
    
    if (target.substr(0, 2) == "//") {
      locatorFunc = locatorType["xpath"];
      return locatorFunc(target);
    }

    if (typeof locatorFunc == "undefined") {
      return `'${target.replace(/'/g, '"')}'`;
    }
    
    return locatorFunc(selectorStr);
  }

  return {
    formatter,
    locator,
  };
};
