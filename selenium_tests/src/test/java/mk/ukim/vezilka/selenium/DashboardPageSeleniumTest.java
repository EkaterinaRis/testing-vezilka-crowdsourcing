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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DashboardPageSeleniumTest {

    private WebDriver driver;
    private WebDriverWait wait;

    private static final String BASE_URL = "http://localhost:5173";

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.manage().window().maximize();

        driver.get(BASE_URL + "/login");
        driver.findElement(By.id("email")).sendKeys("admin@example.com");
        driver.findElement(By.id("password")).sendKeys("password123");
        driver.findElement(By.xpath("//button[normalize-space()='Најави се']")).click();
        wait.until(ExpectedConditions.urlToBe(BASE_URL + "/dashboard"));
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    void dashboardShouldDisplayUserGreeting() {
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//h1[contains(text(), 'Добредојде назад')]")
        ));

        String greeting = driver.findElement(By.xpath("//h1")).getText();
        assertTrue(greeting.contains("Добредојде назад"), "Dashboard should display user greeting");
    }

    @Test
    void dashboardShouldDisplayStats() {
        WebElement totalPointsCard = driver.findElement(By.xpath("//*[contains(text(), 'Вкупно поени')]/ancestor::div[contains(@class, 'border')]"));
        assertTrue(totalPointsCard.isDisplayed(), "Total points card should be visible");
    }

    @Test
    void clickingUploadCardShouldNavigateToUpload() {
        WebElement uploadLink = wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//a[contains(@href, '/upload')]")
        ));
        uploadLink.click();

        wait.until(ExpectedConditions.urlToBe(BASE_URL + "/upload"));
        assertEquals(BASE_URL + "/upload", driver.getCurrentUrl());
    }
}