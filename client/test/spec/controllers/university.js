'use strict';

describe('Controller: UniversityCtrl', function () {

  // load the controller's module
  beforeEach(module('clientApp'));

  var UniversityCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UniversityCtrl = $controller('UniversityCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(UniversityCtrl.awesomeThings.length).toBe(3);
  });
});
