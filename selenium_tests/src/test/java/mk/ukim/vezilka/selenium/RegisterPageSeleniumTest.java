package mk.ukim.vezilka.selenium;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;

class RegisterPageSeleniumTest {

    private WebDriver driver;
    private WebDriverWait wait;

    private static final String BASE_URL = "http://localhost:5173";

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.manage().window().maximize();
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    void registerPageShouldLoad() {
        driver.get(BASE_URL + "/register");
        wait.until(ExpectedConditions.titleIs("Регистрација"));
        assertEquals("Регистрација", driver.getTitle());
    }

    @Test
    void registerPageShouldDisplayAllRequiredFields() {
        driver.get(BASE_URL + "/register");
        assertTrue(driver.findElement(By.id("firstName")).isDisplayed(), "First name field should be displayed");
        assertTrue(driver.findElement(By.id("lastName")).isDisplayed(), "Last name field should be displayed");
        assertTrue(driver.findElement(By.id("email")).isDisplayed(), "Email field should be displayed");
        assertTrue(driver.findElement(By.id("password")).isDisplayed(), "Password field should be displayed");

        assertTrue(driver.findElement(
                By.xpath("//button[normalize-space()='Создај сметка']")).isDisplayed(),
                "Create account button should be displayed");
    }

    @Test
    void firstNameFieldShouldAcceptInput() {
        driver.get(BASE_URL + "/register");
        WebElement firstName = driver.findElement(By.id("firstName"));
        firstName.sendKeys("Петко");
        assertEquals("Петко", firstName.getAttribute("value"));
    }

    @Test
    void lastNameFieldShouldAcceptInput() {
        driver.get(BASE_URL + "/register");
        WebElement lastName = driver.findElement(By.id("lastName"));
        lastName.sendKeys("Петковски");
        assertEquals("Петковски", lastName.getAttribute("value"));
    }

    @Test
    void emailFieldShouldAcceptValidEmail() {
        driver.get(BASE_URL + "/register");
        WebElement email = driver.findElement(By.id("email"));
        email.sendKeys("test@example.com");
        assertEquals("test@example.com", email.getAttribute("value"));
    }

    @Test
    void passwordFieldShouldBeMasked() {
        driver.get(BASE_URL + "/register");
        WebElement password = driver.findElement(By.id("password"));
        assertEquals("password", password.getAttribute("type"), "Password field should be masked");
    }

    @Test
    void createAccountButtonShouldBePresent() {
        driver.get(BASE_URL + "/register");
        WebElement createAccountButton = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//button[normalize-space()='Создај сметка']")));
        assertTrue(createAccountButton.isDisplayed());
        assertTrue(createAccountButton.isEnabled());
    }

    @Test
    void emailCodeButtonShouldBeDisabledWithoutEmail() {
        driver.get(BASE_URL + "/register");
        WebElement sendCodeButton = driver.findElement(By.xpath("//button[normalize-space()='Испрати код']"));
        assertFalse(sendCodeButton.isEnabled(), "Send code button should be disabled when email is empty");
    }

    @Test
    void emailCodeButtonShouldBecomeEnabledAfterEnteringEmail() {
        driver.get(BASE_URL + "/register");
        WebElement email = driver.findElement(By.id("email"));
        email.sendKeys("test@example.com");
        WebElement sendCodeButton = driver.findElement(By.xpath("//button[normalize-space()='Испрати код']"));

        wait.until(ExpectedConditions.elementToBeClickable(sendCodeButton));
        assertTrue(sendCodeButton.isEnabled(), "Send code button should be enabled after entering an email");
    }

    @Test
    void requiredFirstNameValidationShouldBeTriggered() {
        driver.get(BASE_URL + "/register");
        WebElement firstName = driver.findElement(By.id("firstName"));
        WebElement createAccountButton = driver.findElement(By.xpath("//button[normalize-space()='Создај сметка']"));

        createAccountButton.click();
        String validationMessage = firstName.getAttribute("validationMessage");
        assertFalse(validationMessage.isEmpty(), "First name should be required");
    }

    @Test
    void requiredLastNameValidationShouldBeTriggered() {
        driver.get(BASE_URL + "/register");

        WebElement firstName = driver.findElement(By.id("firstName"));
        firstName.sendKeys("Петко");

        WebElement createAccountButton = driver.findElement(By.xpath("//button[normalize-space()='Создај сметка']"));

        createAccountButton.click();
        WebElement lastName = driver.findElement(By.id("lastName"));
        assertFalse(lastName.getAttribute("validationMessage").isEmpty(), "Last name should be required");
    }

    @Test
    void requiredEmailValidationShouldBeTriggered() {
        driver.get(BASE_URL + "/register");
        driver.findElement(By.id("firstName")).sendKeys("Петко");
        driver.findElement(By.id("lastName")).sendKeys("Петковски");

        WebElement createAccountButton = driver.findElement(By.xpath("//button[normalize-space()='Создај сметка']"));

        createAccountButton.click();
        WebElement email = driver.findElement(By.id("email"));
        assertFalse(email.getAttribute("validationMessage").isEmpty(), "Email should be required");
    }

    @Test
    void requiredPasswordValidationShouldBeTriggered() {
        driver.get(BASE_URL + "/register");

        driver.findElement(By.id("firstName")).sendKeys("Петко");
        driver.findElement(By.id("lastName")).sendKeys("Петковски");
        driver.findElement(By.id("email")).sendKeys("test@example.com");

        WebElement createAccountButton = driver.findElement(By.xpath("//button[normalize-space()='Создај сметка']"));
        createAccountButton.click();

        WebElement password = driver.findElement(By.id("password"));
        assertFalse(password.getAttribute("validationMessage").isEmpty(), "Password should be required");
    }

    @Test
    void invalidEmailShouldTriggerBrowserValidation() {
        driver.get(BASE_URL + "/register");
        WebElement email = driver.findElement(By.id("email"));
        email.sendKeys("invalid-email");
        String validationMessage = email.getAttribute("validationMessage");

        assertFalse(validationMessage.isEmpty(), "Invalid email should trigger browser validation");
    }

    @Test
    void verificationCodeFieldShouldNotBeVisibleInitially() {
        driver.get(BASE_URL + "/register");
        assertTrue(driver.findElements(By.id("code")).isEmpty(), "Verification code field should not be visible before sending code");
    }

    @Test
    void loginLinkShouldNavigateToLoginPage() {
        driver.get(BASE_URL + "/register");

        WebElement loginLink = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//a[normalize-space()='Најави се']")));
        loginLink.click();

        wait.until(ExpectedConditions.urlToBe(BASE_URL + "/login"));

        assertEquals(BASE_URL + "/login", driver.getCurrentUrl());
    }

    @Test
    void logoShouldNavigateToHomePage() {
        driver.get(BASE_URL + "/register");

        WebElement logo = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("//a[normalize-space()='Везилка']")));
        logo.click();
        wait.until(ExpectedConditions.urlToBe(BASE_URL + "/"));

        assertEquals(BASE_URL + "/", driver.getCurrentUrl());
    }

    @Test
    void backButtonShouldReturnToPreviousPage() {
        driver.get(BASE_URL);

        WebElement startButton = wait.until(
                ExpectedConditions.elementToBeClickable(
                        By.xpath(
                                "//*[self::a or self::button]" +
                                "[normalize-space()='Започни да придонесуваш']"
                        )
                )
        );

        startButton.click();

        wait.until(ExpectedConditions.urlToBe(BASE_URL + "/register"));

        WebElement backButton = wait.until(
                ExpectedConditions.elementToBeClickable(
                        By.xpath("//button[normalize-space()='Назад']")
                )
        );

        backButton.click();
        wait.until(ExpectedConditions.urlToBe(BASE_URL + "/"));

        assertEquals(
                BASE_URL + "/",
                driver.getCurrentUrl(),
                "'Назад' should return to the previous page"
        );
    }

    @Test
    void enteringEmailShouldClearPreviousError() {
        driver.get(BASE_URL + "/register");
        WebElement email = driver.findElement(By.id("email"));
        email.sendKeys("test@example.com");

        WebElement sendCodeButton = driver.findElement(By.xpath("//button[normalize-space()='Испрати код']"));

        assertTrue(sendCodeButton.isEnabled(), "Send code button should become enabled after entering email");
    }

    @Test
    void sendingVerificationCodeShouldDisplayCodeField() {
        driver.get(BASE_URL + "/register");

        driver.findElement(By.id("firstName")).sendKeys("Test");
        driver.findElement(By.id("lastName")).sendKeys("Test");
        driver.findElement(By.id("email")).sendKeys("admin@example.com");


        WebElement sendCodeButton = wait.until(
                ExpectedConditions.elementToBeClickable(
                        By.xpath("//button[normalize-space()='Испрати код']")
                )
        );

        sendCodeButton.click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("code")));

        WebElement code = driver.findElement(By.id("code"));
        assertTrue(code.isDisplayed(), "Verification code field should appear after sending the code");
    }
}