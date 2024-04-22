Feature: Communities Button

    Background: I am on punchup.com
        Given I go to the '/' page

    Scenario: Clicking the Communities button while not signed-in
        When I click on the 'communities' icon
        Then I see the 'Punchup Communities' title

    Scenario: Clicking the Communities button while signed-in
        And I click on 'Sign in / Register'
        And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        And I click on 'Get Magic Link'
        And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        Then I am at the 'Personal' feed
        When I click on the 'communities' icon
        Then I see the 'Your Communities' pop-up menu