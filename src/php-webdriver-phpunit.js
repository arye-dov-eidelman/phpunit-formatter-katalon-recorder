
function useSeparateEqualsForArray() {
    return true;
}

function testClassName(testName) {
    return testName.split(/[^0-9A-Za-z]+/).map(
        function(x) {
            return capitalize(x);
        }).join('')+"Test";
}

function testMethodName(testName) {
    return "test" + testName.split(/[^0-9A-Za-z]+/).map(
        function(x) {
            return capitalize(x);
        }).join('');
}

function nonBreakingSpace() {
    return "\"\\u00a0\"";
}

function array(value) {
    let str = '[';
    for ( let i = 0; i < value.length; i++) {
        str += string(value[i]);
        if (i < value.length - 1)
            str += ", ";
    }
    str += ']';
    return str;
};

Equals.prototype.toString = function() {
    return this.e1.toString() + " == " + this.e2.toString();
};

Equals.prototype.assert = function() {
    return "$this->assertEquals(" + this.e1.toString() +", " + this.e2.toString() +");";
};

Equals.prototype.verify = function() {
    return verify(this.assert());
};

NotEquals.prototype.toString = function() {
    return this.e1.toString() + " != " + this.e2.toString();
};

NotEquals.prototype.assert = function() {
    return "$this->assertNotEquals(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

NotEquals.prototype.verify = function() {
    return verify(this.assert());
};

function joinExpression(expression) {
    return "implode(',', " + expression.toString() + ")";
}

function statement(expression) {
    let s = expression.toString();
    if (s.length == 0) {
        return null;
    }
    return s + ';';
}

function assignToVariable(type, variable, expression) {
    return "$" + variable + " = " + expression.toString();
}

variableName = function(value) {
    return "$" + value;
};

function ifCondition(expression, callback) {
    return "if (" + expression.toString() + ") {\n" + callback() + "}";
}

function assertTrue(expression) {
    return "$this->assertTrue(" + expression.toString() + ");";
}

function assertFalse(expression) {
    return "$this->assertFalse(" + expression.toString() + ");";
}

function verify(statement) {
    return "try {\n" +
        indents(1) + statement + "\n" +
        "} catch (PHPUnit\\Framework\\AssertionFailedError $e) {\n" +
        indents(1) + "array_push($this->verificationErrors, $e->__toString());\n" +
        "}";
}

function verifyTrue(expression) {
    return verify(assertTrue(expression));
}

function verifyFalse(expression) {
    return verify(assertFalse(expression));
}

RegexpMatch.prototype.toString = function() {
    return "(bool)preg_match('/" + this.pattern.replace(/\//g, "\\/") + "/'," + this.expression + ")";
};

function waitFor(expression) {
    return "for ($second = 0; ; $second++) {\n" +
        indent(1) + 'if ($second >= 60) $this->fail("timeout");\n' +
        indent(1) + "try {\n" +
        indent(2) + (expression.setup ? expression.setup() + " " : "") +
        indent(2) + "if (" + expression.toString() + ") break;\n" +
        indent(1) + "} catch (Exception $e) {}\n" +
        indent(1) + "sleep(1);\n" +
        "}\n";
}

function assertOrVerifyFailure(line, isAssert) {
    let message = '"expected failure"';
    let failStatement = "fail(" + message + ");";
    return "try { " + line + " " + failStatement + "} catch (Exception $e) {}";
};

function pause(milliseconds) {
    return "usleep(" + parseInt(milliseconds, 10) + ");";
}

function echo(message) {
    return "print(" + xlateArgument(message) + ");";
}

function formatComment(comment) {
    return comment.comment.replace(/.+/mg, function(str) {
        return "// " + str;
    });
}

/**
 * Returns a string representing the suite for this formatter language.
 *
 * @param testSuite  the suite to format
 * @param filename   the file the formatted suite will be saved as
 */
function formatSuite(testSuite, filename) {
    let suiteClass = /^(\w+)/.exec(filename)[1];
    suiteClass = suiteClass[0].toUpperCase() + suiteClass.substring(1);

    let formattedSuite = "<phpunit>\n"
        + indents(1) + "<testsuites>\n"
        + indents(2) + "<testsuite name='" + suiteClass + "'>\n";

    for (let i = 0; i < testSuite.tests.length; ++i) {
        let testClass = testSuite.tests[i].getTitle();
        formattedSuite += indents(3)
            + "<file>" + testClass + "<file>\n";
    }

    formattedSuite += indents(2) + "</testsuite>\n"
        + indents(1) + "</testsuites>\n"
        + "</phpunit>\n";

    return formattedSuite;
}

function defaultExtension() {
    return this.options.defaultExtension;
}


this.options = {
    receiver: '$this->webDriver',
    namespace: 'Test',
    extendedClass: 'TestCase',
    indent: '4',
    initialIndents: '2',
    showSelenese: 'true',
    defaultExtension: 'php',
};

options.header =
    "<?php\n"
    + "namespace ${namespace};\n"
    + "\n"
    + "use PHPUnit\\Framework\\TestCase;\n"
    + "use Facebook\\WebDriver;\n"
    +"\n"
    + "class ${className} extends ${extendedClass}\n"
    + "{\n"
    + indents(1) + "/**\n"
    + indents(1) + " * init webdriver\n"
    + indents(1) + " */\n"
    + indents(1) + "public function setUp()\n"
    + indents(1) + "{\n"
    + indents(2) + "${receiver} = WebDriver\\RemoteWebDriver::create(\n"
    + indents(3) + "$_SERVER['SELENIUM_HUB'],\n"
    + indents(3) + "WebDriver\\DesiredCapabilities::chrome();\n"
    + indents(2) + ");\n"
    + indents(2) + "$this->baseUrl = $_SERVER['SELENIUM_BASE_URL'];\n"
    + indents(1) + "}\n"
    + indents(0) + "\n"
    + indents(1) + "/**\n"
    + indents(1) + " * Method ${methodName}\n"
    + indents(1) + " * @test\n"
    + indents(1) + " */\n"
    + indents(1) + "public function ${methodName}()\n"
    + indents(1) + "{\n";

options.footer =
    indents(1) + "}\n"
    + indents(1) + "/**\n"
    + indents(1) + " * Close the current window.\n"
    + indents(1) + " */\n"
    + indents(1) + "public function tearDown()\n"
    + indents(1) + "{\n"
    + indents(2) + "$this->webDriver->close();\n"
    + indents(1) + "}\n"
    + "\n"
    + "}\n";


this.configForm =
    '<description>Variable for Selenium instance</description>' +
    '<textbox id="options_receiver" />' +
    '<description>Header</description>' +
    '<textbox id="options_header" multiline="true" flex="1" rows="4" />' +
    '<description>Environment</description>' +
    '<textbox id="options_environment" />' +
    '<description>Namespace</description>' +
    '<textbox id="options_namespace" />' +
    '<description>Extended class</description>' +
    '<textbox id="options_extendedClass" />' +
    '<checkbox id="options_showSelenese" label="Show Selenese"/>'+
    '<description>Indent</description>' +
    '<menulist id="options_indent"><menupopup>' +
    '<menuitem label="Tab" value="tab"/>' +
    '<menuitem label="2 spaces" value="2"/>' +
    '<menuitem label="4 spaces" value="4"/>' +
    '</menupopup>' +
    '</menulist>';

this.name = 'PHPUnit (Framework_TestCase)';
this.testcaseExtension = '.php';
this.suiteExtension = '.xml';
this.webdriver = true;

WDAPI.Driver = function() {
    this.ref = '$this->webDriver';
};

WDAPI.Driver.searchContext = function(locatorType, locator) {
    let locatorString = xlateArgument(locator);
    switch (locatorType) {
        case 'xpath':
            return 'WebDriver\\WebDriverBy::xpath(' + locatorString + ')';
        case 'css':
            return 'WebDriver\\WebDriverBy::cssSelector(' + locatorString + ')';
        case 'id':
            return 'WebDriver\\WebDriverBy::id(' + locatorString + ')';
        case 'link':
            return 'WebDriver\\WebDriverBy::linkText(' + locatorString + ')';
        case 'name':
            return 'WebDriver\\WebDriverBy::name(' + locatorString + ')';
        case 'tag_name':
            return 'WebDriver\\WebDriverBy::tagName(' + locatorString + ')';
    }
    throw 'Error: unknown strategy [' + locatorType + '] for locator [' + locator + ']';
};

WDAPI.Driver.prototype.back = function() {
    return this.ref + "->back()";
};

WDAPI.Driver.prototype.close = function() {
    return this.ref + "->close()";
};

WDAPI.Driver.prototype.findElement = function(locatorType, locator) {
    return new WDAPI.Element(this.ref + "->findElement(" + WDAPI.Driver.searchContext(locatorType, locator) + ")");
};

WDAPI.Driver.prototype.findElements = function(locatorType, locator) {
    return new WDAPI.ElementList(this.ref + "->findElements(" + WDAPI.Driver.searchContext(locatorType, locator) + ")");
};

WDAPI.Driver.prototype.getCurrentUrl = function() {
    return this.ref + "->getCurrentURL()";
};

WDAPI.Driver.prototype.get = function(url) {
    if (url.length > 1 && (url.substring(1,8) == "http://" || url.substring(1,9) == "https://")) { // url is quoted
        return this.ref + "->get(" + url + ")";
    } else {
        return this.ref + "->get($this->baseUrl . " + url + ")";
    }
};

WDAPI.Driver.prototype.getTitle = function() {
    return this.ref + "->getTitle()";
};

WDAPI.Driver.prototype.refresh = function() {
    return this.ref + "->refresh()";
};

WDAPI.Driver.prototype.isTextPresent = function() {
    return this.ref + "->refresh()";
};




WDAPI.Element = function(ref) {
    this.ref = ref;
};

WDAPI.Element.prototype.clear = function() {
    return this.ref + "->clear()";
};

WDAPI.Element.prototype.click = function() {
    return this.ref + "->click()";
};

WDAPI.Element.prototype.getAttribute = function(attributeName) {
    return this.ref + "->attribute(" + xlateArgument(attributeName) + ")";
};

WDAPI.Element.prototype.getText = function() {
    return this.ref + "->text()";
};

WDAPI.Element.prototype.isDisplayed = function() {
    return this.ref + "->displayed()";
};

WDAPI.Element.prototype.isSelected = function() {
    return this.ref + "->selected()";
};

WDAPI.Element.prototype.sendKeys = function(text) {
    return "$this->keys(" + xlateArgument(text) + ")";
};

WDAPI.Element.prototype.submit = function() {
    return this.ref + "->submit()";
};

WDAPI.Element.prototype.select = function(label) {
    return "$this->select(" + this.ref + ")->selectOptionByLabel(" + xlateArgument(label) + ")";
};

WDAPI.Element.prototype.setValue = function(value) {
    return this.ref + "->sendKeys(" + xlateArgument(value) + ")";
};

WDAPI.ElementList = function(ref) {
    this.ref = ref;
};

WDAPI.ElementList.prototype.getItem = function(index) {
    return this.ref + "[" + index + "]";
};

WDAPI.ElementList.prototype.getSize = function() {
    return this.ref + "->size()";
};

WDAPI.Utils = function() {
};

WDAPI.Utils.isElementPresent = function(how, what) {
    let driver = new WDAPI.Driver();
    return driver.ref + "->findElements(" + WDAPI.Driver.searchContext(how, what) + ")";
};


//////////////////////////////////////////////////////////////////////
// overwrite webdriver.js
//////////////////////////////////////////////////////////////////////

SeleniumWebDriverAdaptor.prototype.isTextPresent = function() {
    let target = this.rawArgs[0];
    return '(bool)strpos(strip_tags($this->source()), ' + "'" + target + "'" + ')';
}

SeleniumWebDriverAdaptor.prototype.type = function(elementLocator, text) {
    let locator = this._elementLocator(this.rawArgs[0]);
    let driver = new WDAPI.Driver();
    let webElement = driver.findElement(locator.type, locator.string);
    return webElement.setValue(this.rawArgs[1]);
};
