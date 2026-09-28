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

class LoginPageSeleniumTest {

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
    void loginWithValidCredentialsShouldRedirectToDashboard() {
        driver.get(BASE_URL + "/login");

        driver.findElement(By.id("email")).sendKeys("admin@example.com"); // Assumes a user exists
        driver.findElement(By.id("password")).sendKeys("password123");

        WebElement loginButton = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[normalize-space()='Најави се']")
        ));
        loginButton.click();

        wait.until(ExpectedConditions.urlToBe(BASE_URL + "/dashboard"));
        assertEquals(BASE_URL + "/dashboard", driver.getCurrentUrl());
    }

    @Test
    void loginWithInvalidCredentialsShouldShowError() {
        driver.get(BASE_URL + "/login");

        driver.findElement(By.id("email")).sendKeys("wrong@example.com");
        driver.findElement(By.id("password")).sendKeys("wrongpassword");

        WebElement loginButton = driver.findElement(By.xpath("//button[normalize-space()='Најави се']"));
        loginButton.click();

        WebElement errorDiv = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//div[contains(@class, 'text-red-700')]")
        ));

        assertTrue(errorDiv.isDisplayed(), "Error message should be displayed");
        assertTrue(errorDiv.getText().contains("Погрешна е-пошта или лозинка"),
                "Error message should indicate invalid credentials");
    }

    @Test
    void emptyFieldsShouldTriggerValidation() {
        driver.get(BASE_URL + "/login");

        WebElement loginButton = driver.findElement(By.xpath("//button[normalize-space()='Најави се']"));
        loginButton.click();

        WebElement emailField = driver.findElement(By.id("email"));
        assertFalse(emailField.getAttribute("validationMessage").isEmpty(),
                "Email validation message should appear");
    }

    @Test
    void registerLinkShouldNavigateToRegister() {
        driver.get(BASE_URL + "/login");

        WebElement registerLink = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//a[normalize-space()='Регистрирај се']")
        ));
        registerLink.click();

        wait.until(ExpectedConditions.urlToBe(BASE_URL + "/register"));
        assertEquals(BASE_URL + "/register", driver.getCurrentUrl());
    }
}