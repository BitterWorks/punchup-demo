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
        And I click on 'Post'
        And I input 'test post test pokus 1' under 'Title'
        And I click on 'Publish'
        And refresh
        Then I see the 'test post test pokus 1' post title

    Scenario: Expand and post
        And I click on 'Create'
        And I click on 'Post'
        And I click on 'Expand Editor'
        And I input 'test post expanded 8 try' under 'Untitled Post'
        And I click on 'Publish'
        And I wait for '1' seconds
        And I click on the 'home' icon 
        And I wait for '1' seconds
        Then I see the 'test post expanded 8 try' post title

    Scenario: Emoji-only post
        And I click on 'Create'
        And I click on 'Post'
        And I wait for '1' seconds
        And I click on the 'emoji' icon
        And I click on the '😀' emoji
        And I click on 'Publish'
        And pause
        And refresh
        Then I see the '😀' post title

    Scenario: Text with emoji post
        And I click on 'Create'
        And I click on 'Post'
        And I input 'test hello test 2 ' under 'Title'
        And I click on the 'emoji' icon
        And I click on the '😀' emoji
        And I click on 'Publish'
        And refresh
        Then I see the 'test hello test 2 😀' post title

    Scenario: Image-only post
        And I click on 'Create'
        And I click on 'Post'
        And I upload "dog.jpg" under "imageUpload"
        And I wait for '3' seconds
        And I click on 'Publish'
        And refresh
        And pause

    Scenario: Image with text post
        And I click on 'Create'
        And I click on 'Post'
        And I input 'test image with text' under 'Title'
        And I upload "dog.jpg" under "imageUpload"
        And I wait for '3' seconds
        And I click on 'Publish'
        And refresh
        Then I see the 'test image with text' post title