describe("DataService", function() {
  this.dataService;

  beforeEach(function() {
    module("UPDashboard");
    inject(function(dataService) {
      this.dataService = dataService;
    });
  });

  it("_populateData : should parse JSON payload and populate payload data", function() {
    var data = {
      type: "pageload",
      content: {
        interestsProfile: true,
        interestsHosts: true,
        requestingSites: true,
      }
    }
    spyOn(dataService, "_populateData").andCallThrough();
    dataService._populateData(JSON.stringify(data));
    expect(dataService._interestsProfile).toBe(true);
    expect(dataService._interestsHosts).toBe(true);
    expect(dataService._requestingSites).toBe(true);
  });

  it("_sendToBrowser++ : should send structured data to the browser", function() {
    var eventHandler = jasmine.createSpy("eventHandler");
    window.document.addEventListener("RemoteUserProfileCommand", eventHandler, false);

    var testIndex = 0;
    function testEvent(eventSpy, expectedResult) {
      var evt = eventSpy.argsForCall[testIndex][0];
      expect(eventSpy).toHaveBeenCalled();
      expect(typeof(evt)).toBe("object");
      expect(evt.detail).toBeIdenticalTo(expectedResult);
      testIndex += 1;
    }

    // test the raw _sendToBrowser function
    dataService._sendToBrowser("Joke", "rigmarole");
    testEvent(eventHandler, {command: "Joke", data: "rigmarole"});

    // test wrappers for sentToBrowser
    
    dataService.disableUP();
    testEvent(eventHandler, {command: "DisableUP"});

    dataService.enableUP();
    testEvent(eventHandler, {command: "EnableUP"});

    dataService.reqPrefs();
    testEvent(eventHandler, {command: "RequestCurrentPrefs"});

    dataService.reqPagePayload();
    testEvent(eventHandler, {command: "RequestCurrentPagePayload"});

    dataService.setInterestSharable("coffee", true);
    testEvent(eventHandler, {command: "SetInterestSharable", data: ["coffee", true]});
    dataService.setInterestSharable("meetings", false);
    testEvent(eventHandler, {command: "SetInterestSharable", data: ["meetings", false]});
    dataService.setInterestSharable("meetings");
    testEvent(eventHandler, {command: "SetInterestSharable", data: ["meetings", undefined]});
    dataService.setInterestSharable();
    testEvent(eventHandler, {command: "SetInterestSharable", data: [undefined, undefined]});

    dataService.disableSite();
    testEvent(eventHandler, {command: "DisableSite"});
  });
});
