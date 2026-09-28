package mk.ukim.vezilka.selenium;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class HomePageSeleniumTest {

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
    void clickingStartContributingButtonShouldNavigateToRegister() {
        driver.get(BASE_URL);
        By startContributingButton = By.xpath("//button[normalize-space()='Започни да придонесуваш']");

        wait.until(ExpectedConditions.elementToBeClickable(startContributingButton)).click();
        wait.until(driver -> driver.getCurrentUrl().equals(BASE_URL + "/register"));

        assertEquals(BASE_URL + "/register", driver.getCurrentUrl());
    }

    @Test
    void clickingNavbarStartButtonShouldNavigateToRegister() {
        driver.get(BASE_URL);
        By navbarStartButton = By.xpath("//button[normalize-space()='Започни']");

        wait.until(ExpectedConditions.elementToBeClickable(navbarStartButton)).click();
        wait.until(driver -> driver.getCurrentUrl().equals(BASE_URL + "/register"));

        assertEquals(BASE_URL + "/register", driver.getCurrentUrl());
    }

    @Test
    void clickingNavbarLoginButtonShouldNavigateToLogin() {
        driver.get(BASE_URL);
        By loginButton = By.xpath("//*[self::a or self::button][normalize-space()='Најава']");

        wait.until(ExpectedConditions.elementToBeClickable(loginButton)).click();
        wait.until(ExpectedConditions.urlToBe(BASE_URL + "/login"));

        assertEquals(BASE_URL + "/login", driver.getCurrentUrl(), "Clicking navbar 'Најава' should navigate to /login");
    }

    @Test
    void clickingLearnMoreButtonShouldScrollToHowItWorks() {
        driver.get(BASE_URL);

        By learnMoreButton = By.xpath("//*[self::a or self::button][normalize-space()='Дознај повеќе']");

        wait.until(ExpectedConditions.elementToBeClickable(learnMoreButton)).click();
        wait.until(ExpectedConditions.urlContains("#how-it-works"));

        wait.until(driver -> {
            JavascriptExecutor js = (JavascriptExecutor) driver;

            return (Boolean) js.executeScript("""
            const element = document.getElementById('how-it-works');
            if (!element) return false;

            const rect = element.getBoundingClientRect();

            return rect.top >= 0 &&
                   rect.top < window.innerHeight;
        """);
        });

        assertTrue(driver.getCurrentUrl().contains("#how-it-works"), "'Дознај повеќе' should navigate to #how-it-works");
    }

    @Test
    void clickingHowItWorksButtonShouldScrollToHowItWorks() {
        driver.get(BASE_URL);
        By howItWorksButton = By.xpath("//*[self::a or self::button][normalize-space()='Како функционира']");
        By howItWorksSection = By.xpath("//*[normalize-space()='Како функционира']");

        wait.until(ExpectedConditions.elementToBeClickable(howItWorksButton)).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(howItWorksSection));

        wait.until(driver -> {
            WebElement element = driver.findElement(howItWorksSection);
            JavascriptExecutor js = (JavascriptExecutor) driver;
            return (Boolean) js.executeScript("""
            const rect = arguments[0].getBoundingClientRect();
            return rect.top >= 0 &&
                   rect.top <= window.innerHeight; """, element);
        });

        assertTrue(driver.findElement(howItWorksSection).isDisplayed(), "'Како функционира' section should be visible after clicking the button");
    }

    @Test
    void clickingFeaturesButtonShouldScrollToFeatures() {
        driver.get(BASE_URL);

        By featuresButton = By.xpath("//*[self::a or self::button][normalize-space()='Можности']");
        By featuresSection = By.xpath("//*[normalize-space()='Што можеш да правиш']");

        wait.until(ExpectedConditions.elementToBeClickable(featuresButton)).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(featuresSection));

        wait.until(driver -> {
            WebElement element = driver.findElement(featuresSection);

            JavascriptExecutor js = (JavascriptExecutor) driver;

            return (Boolean) js.executeScript("""
            const rect = arguments[0].getBoundingClientRect();
            return rect.top >= 0 &&
                   rect.top <= window.innerHeight;""", element);
        });

        assertTrue(driver.findElement(featuresSection).isDisplayed(), "'Можности' section should be visible after clicking the button");
    }

    @Test
    void clickingDataButtonShouldNavigateToPublicFiles() {
        driver.get(BASE_URL);

        By dataButton = By.xpath("//*[self::a or self::button][normalize-space()='Податоци']");

        wait.until(ExpectedConditions.elementToBeClickable(dataButton)).click();
        wait.until(ExpectedConditions.urlToBe(BASE_URL + "/public-files"));

        assertEquals(BASE_URL + "/public-files", driver.getCurrentUrl(), "Clicking 'Податоци' should navigate to /public-files");
    }

}