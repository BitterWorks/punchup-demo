Feature: Conversations

    Background: Valid login w/ exiting email using Magic Link
        Given I go to the '/' page
        And I click on 'Sign in / Register'
        And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        And I click on 'Get Magic Link'
        And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        Then I am at the 'Personal' feed
    @smoke
    Scenario: Send a message with text
        When I click on the 'conversations' icon
        And pause
        # And I click on 'Hero'
        And I click on 'Josef' user in the conversations menu
        And pause
        And I save the current datetime as 'initialDateTime'
        And pause
        # And I input 'text message 11' under 'Message Hero'
        And I input 'text message 11' under 'Message Josef'
        And pause
        And I press 'Enter'
        And pause
        Then I see that the last message contains 'text message 11' and was sent after 'initialDateTime'
        # Then NEW I see that the last message contains 'text message 11' and was sent after 'initialDateTime'
