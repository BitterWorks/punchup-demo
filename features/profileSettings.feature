Feature: Account Profile Settings

    Background: Valid login w/ exiting email using Magic Link
        Given I go to the '/' page
        And I click on 'Sign in / Register'
        And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        And I click on 'Get Magic Link'
        And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        Then I am at the 'Personal' feed

    Scenario: Change profile picture
        When I click on the profile icon
        And I click on 'Account Settings'
        And I upload 'cat.jpg' under 'Change'
        And I click on the 'checkMark' icon
        And pause

    Scenario: Change profile Handle
        When I click on the profile icon
        And I click on 'Account Settings'
        And I clear the text under 'Handle'
        And I input 'jorge-test-handle' under 'Handle'
        And I click on the 'checkMark' icon
        And I wait for '4' seconds
        And I click on the 'x' icon
        And I click on the profile icon
        Then I see the 'jorge-test-handle' handle

    Scenario: Change profile Display Name
        When I click on the profile icon
        And I click on 'Account Settings'
        And I clear the text under 'Display Name'
        And I input 'tester Jo' under 'Display Name'
        And I click on the 'checkMark' icon
        And I wait for '4' seconds
        And I click on the 'x' icon
        And I click on the profile icon
        Then I see the 'tester Jo' Display Name

    Scenario: Change profile Tagline
        When I click on the profile icon
        And I click on 'Account Settings'
        And I clear the text under 'Tagline'
        And I input 'my tagline test' under 'Tagline'
        And I click on the 'checkMark' icon
        And I wait for '4' seconds
        And I click on the 'x' icon
        And I click on the profile icon
        And I click on 'tester Jo'
        Then I see the 'my tagline test' title