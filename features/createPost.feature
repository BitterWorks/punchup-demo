Feature: Create Post

    Background: Valid login w/ exiting email using Magic Link
        Given I go to the '/' page
        And I click on 'Sign in / Register'
        And I input 'jorge@0fxrlxug.mailosaur.net' under 'Email'
        And I click on 'Get Magic Link'
        And I wait for "jorge@0fxrlxug.mailosaur.net" to receive a "Sign In to Punchup" email
        And I go to the "Sign In" link of the "Sign In to Punchup" email sent to "jorge@0fxrlxug.mailosaur.net"
        Then I am at the 'Personal' feed
    
    @smoke
    Scenario: Text-only post
        And I click on 'Create'
        And pause
        And I click on 'Post'
        And pause
        And I input 'test' under 'Title'
        And pause
        And I click on 'Publish'
        And pause

    Scenario: Expand and post
        And I click on 'Create'
        And pause
        And I click on 'Post'
        And pause
        And I click on 'Expand Editor'
        And pause
        And I input 'test' under 'Untitled Post'
        And pause
        And I click on 'Publish'
        And pause

    Scenario: Emoji-only post
        And I click on 'Create'
        And pause
        And I click on 'Post'
        And pause
        And I click on the 'emoji' icon
        And pause
        And I click on '😀' emoji
        And pause
        And I click on 'Publish'
        And pause

    Scenario: Text with emoji post
        And I click on 'Create'
        And pause
        And I click on 'Post'
        And pause
        And I input 'test' under 'Title'
        And pause
        And I click on the 'emoji' icon
        And pause
        And I click on '😀' emoji
        And pause
        And I click on 'Publish'
        And pause

    Scenario: Image post
        And I click on 'Create'
        And pause
        And I click on 'Post'
        And pause
        # And I click on the 'image' icon
        And I upload "dog.jpg" under "imageUpload"
        And pause
        And I click on 'Publish'
        And pause