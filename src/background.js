// Chrome Extension ID: ljdobmomdgdljniojadhoplhkpialdid
// Firefox Extension ID: {91f05833-bab1-4fb1-b9e4-187091a4d75d}
const extensionId = 'ljdobmomdgdljniojadhoplhkpialdid';

function register() {
    chrome.runtime.sendMessage(
        extensionId,
        {
            type: 'katalon_recorder_register',
            payload: {
                summary: 'PHP (Webdriver + PHPUnit)'
            }
        }
    );
}

register();

setInterval(register, 60 * 1000);

// load Selenium IDE command reference
fetch('src/selenium/iedoc-core.xml').then((response) => {
    if (response.ok) {
        response.text().then((text) => {
            let parser = new DOMParser();
            let xmlDoc = parser.parseFromString(text, "text/xml");
            Command.apiDocuments.push(xmlDoc);
        });

    }
}).catch(console.error);

chrome.runtime.onMessageExternal.addListener(function(message, sender, sendResponse) {
    if (message.type === 'katalon_recorder_export') {
        let name = message.payload.name;
        let commands = message.payload.commands;
        let testCase = new TestCase(name);
        testCase.commands = [];
        commands.forEach((command) => {
            testCase.commands.push(new Command(command.command, command.target, command.value))
        });
        testCase.formatLocal(name).header = "";
        testCase.formatLocal(name).footer = "";
        sendResponse({
            status: true,
            payload: {
                content: format(testCase, name)
            }
        });
    }
});
