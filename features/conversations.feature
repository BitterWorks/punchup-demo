Feature: Conversations

    Background: Valid login w/ exiting email using Magic Link
        Given I go to the '/' page
        And I click on 'Sign in / Register'
        And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        And I click on 'Get Magic Link'
        And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        Then I am at the 'Personal' feed

    @smoke @unstable
    Scenario: Send a message with text
        When I click on the 'conversations' icon
        And I click on 'Joseftest' user in the conversations menu
        And I save the current datetime as 'initialDateTime'
        And I input 'text message 11' under 'Message Joseftest'
        And I press 'Enter'
        And I wait for '1' seconds
        Then I see that the last message contains 'text message 11' and was sent after 'initialDateTime'