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
    },
    css: (target) => {
      return `find_element_by_css_selector('${target.replace(/'/g, "\\'")}')`;
    },
    id: (target) => {
      return `find_element_by_id('${target.replace(/'/g, "\\'")}')`;
    }
  };

  const specialKeyMap = {
    '\${KEY_LEFT}': 'Keys.ARROW_LEFT',
    '\${KEY_UP}': 'Keys.ARROW_UP',
    '\${KEY_RIGHT}': 'Keys.ARROW_RIGHT',
    '\${KEY_DOWN}': 'Keys.ARROW_DOWN',
    '\${KEY_PAGE_UP}': 'Keys.PAGE_UP',
    '\${KEY_PAGE_DOWN}': 'Keys.PAGE_DOWN',
    '\${KEY_BACKSPACE}': 'Keys.BACKSPACE',
    '\${KEY_DEL}': 'Keys.DELETE',
    '\${KEY_DELETE}': 'Keys.BACKSPACE',
    '\${KEY_ENTER}': 'Keys.ENTER',
    '\${KEY_TAB}': 'Keys.TAB',
    '\${KEY_HOME}': 'Keys.HOME',
    '\${KEY_END}': 'Keys.END'
  }

  // Selenese command conversion
  const seleneseCommands = {
    "open": "# Get URL\n\t\tdriver.get('_TARGET_')",
    "pause": "# Pause\n\t\ttime.sleep(_VALUE_/1000)",
    "click": 
      "# Click\n" +
      "\t\tWebDriverWait(driver, MAX_WAIT).until(lambda x: x._BY_LOCATOR_)\n" +
      "\t\tdriver.execute_script('arguments[0].click();', driver._BY_LOCATOR_)",
    "type": 
      "# Type\n" +
      "\t\tWebDriverWait(driver, MAX_WAIT).until(lambda x: x._BY_LOCATOR_)\n" +
      "\t\tdriver._BY_LOCATOR_.send_keys('_VALUE_')",
    "sendKeys": 
      "# Send key\n" +
      "\t\tWebDriverWait(driver, MAX_WAIT).until(lambda x: x._BY_LOCATOR_)\n" +
      "\t\tdriver._BY_LOCATOR_.send_keys(_SEND_KEY_)",
    "verifyTitle": 
      "# Verify Title\n" +
      "\t\tif driver.title != '_TARGET_':\n" +
      "\t\t\tNON_FATAL += 1\n" +
      "\t\t\tstandard_output(driver, ln, 'failed', 'Title does not match - _TARGET_ != ' + driver.title, 'verify')\n" +
      "\t\telse:\n" +
      "\t\t\tstandard_output(driver, ln, 'passed', 'Title matches - _TARGET_', 'verify')",
    "assertTitle":
      "# Assert Title\n" +
      "\t\tif driver.title != '_TARGET_':\n" +
      "\t\t\tstandard_output(driver, ln, 'failed', 'Title does not match - _TARGET_ != ' + driver.title, 'assert')\n" +
      "\t\t\treturn -1\n" +
      "\t\telse:\n" +
      "\t\t\tstandard_output(driver, ln, 'passed', 'Title matches - _TARGET_', 'assert')",
    "verifyText":
      "# Verify Text\n" +
      "\t\tWebDriverWait(driver, MAX_WAIT).until(lambda x: x._BY_LOCATOR_)\n" +
      "\t\tdriver.execute_script('arguments[0].scrollIntoView();', driver._BY_LOCATOR_)\n" +
      "\t\tif is_safari and driver._BY_LOCATOR_.get_attribute('innerText') != '_VALUE_STR_':\n" +
      "\t\t\tNON_FATAL += 1\n" +
      "\t\t\tstandard_output(driver, ln, 'failed', 'Text does not match - _VALUE_STR_ != ' + driver._BY_LOCATOR_.get_attribute('innerText'), 'verify')\n" +
      "\t\telif not is_safari and driver._BY_LOCATOR_.text != '_VALUE_STR_':\n" +
      "\t\t\tNON_FATAL += 1\n" +
      "\t\t\tstandard_output(driver, ln, 'failed', 'Text does not match - _VALUE_STR_ != ' + driver._BY_LOCATOR_.text, 'verify')\n" +
      "\t\telse:\n" +
      "\t\t\tstandard_output(driver, ln, 'passed', 'Text matches - _VALUE_STR_', 'verify')",
    "assertText":
      "# Assert Text\n" +
      "\t\tWebDriverWait(driver, MAX_WAIT).until(lambda x: x._BY_LOCATOR_)\n" +
      "\t\tdriver.execute_script('arguments[0].scrollIntoView();', driver._BY_LOCATOR_)\n" +
      "\t\tif is_safari and driver._BY_LOCATOR_.get_attribute('innerText') != '_VALUE_STR_':\n" +
      "\t\t\tstandard_output(driver, ln, 'failed', 'Text does not match - _VALUE_STR_ != ' + driver._BY_LOCATOR_.get_attribute('innerText'), 'assert')\n" +
      "\t\t\treturn -1\n" +
      "\t\telif not is_safari and driver._BY_LOCATOR_.text != '_VALUE_STR_':\n" +
      "\t\t\tstandard_output(driver, ln, 'failed', 'Text does not match - _VALUE_STR_ != ' + driver._BY_LOCATOR_.text, 'assert')\n" +
      "\t\t\treturn -1\n" +
      "\t\telse:\n" +
      "\t\t\tstandard_output(driver, ln, 'passed', 'Text matches - _VALUE_STR_', 'assert')",
    "verifyValue":
      "# Verify Value\n" +
      "\t\tWebDriverWait(driver, MAX_WAIT).until(lambda x: x._BY_LOCATOR_)\n" +
      "\t\tif driver._BY_LOCATOR_.get_attribute('value') != '_VALUE_STR_':\n" +
      "\t\t\tNON_FATAL += 1\n" +
      "\t\t\tstandard_output(driver, ln, 'failed', 'Value does not match - _VALUE_STR_ != ' + driver._BY_LOCATOR_.get_attribute('value'), 'verify')\n" +
      "\t\telse:\n" +
      "\t\t\tstandard_output(driver, ln, 'passed', 'Value matches - _VALUE_STR_', 'verify')",
    "assertValue":
      "# Assert Value\n" +
      "\t\tWebDriverWait(driver, MAX_WAIT).until(lambda x: x._BY_LOCATOR_)\n" +
      "\t\tif driver._BY_LOCATOR_.get_attribute('value') != '_VALUE_STR_':\n" +
      "\t\t\tstandard_output(driver, ln, 'failed', 'Value does not match - _VALUE_STR_ != ' + driver._BY_LOCATOR_.get_attribute('value'), 'assert')\n" +
      "\t\t\treturn -1\n" +
      "\t\telse:\n" +
      "\t\t\tstandard_output(driver, ln, 'passed', 'Value matches - _VALUE_STR_', 'assert')",
    "editContent":
      "# Edit content\n" +
      "\t\tdriver.execute_script(\"arguments[0].innerText = '_VALUE_STR_'\", driver._BY_LOCATOR_)"
  };

  const header =
    "# BEGIN - _SCRIPT_NAME_\n" +
    "from selenium import webdriver\n" +
    "from selenium.webdriver.common.keys import Keys\n" +
    "from selenium.webdriver.support.wait import WebDriverWait\n" +
    "from selenium.common.exceptions import NoSuchElementException\n" +
    "from selenium.common.exceptions import TimeoutException\n" +
    "import time\n" +
    "import sys\n" +
    "from customoutput import standard_output, test_pass\n\n" +
    "def selenium_test(driver, ln, is_safari):\n" +
    "\ttry:\n" +
    "\t\tNON_FATAL = 0\n" +
    "\t\tMAX_WAIT = 10\n\n";
  const footer = 
    "\t\t#Test pass\n" +
    "\t\ttest_pass(driver, ln, NON_FATAL)\n" +
    "\texcept NoSuchElementException:\n" +
    "\t\tprint(f'{Fore.RED}Error: Element not found on line {sys.exc_info()[2].tb_lineno}. Make sure the element is present and add/increase pause time{Style.RESET_ALL}')\n" +
    "# END";

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
          accObj.content += `\n\n\t\t# WARNING: unsupported command ${command}. Object= ${JSON.stringify(commandObj)}\n\n\n`;
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
          .replace(/_SEND_KEY_/g, specialKeyMap[value])
          .replace(/_VALUE_STR_/g, valueStr)
          .replace(/_VALUE_/g, value)
          .replace(/_SELECT_OPTION_/g, selectOption);

        accObj.step += 1;
        accObj.content += `\t\t${funcStr}\n`;

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
