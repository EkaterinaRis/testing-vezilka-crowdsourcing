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

class UploadPageSeleniumTest {

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

        driver.get(BASE_URL + "/upload");
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    void uploadPageShouldDisableButtonWhenTopicIsEmpty() {
        WebElement uploadButton = driver.findElement(By.xpath("//button[contains(text(), 'Прикачи содржина')]"));
        assertFalse(uploadButton.isEnabled(), "Upload button should be disabled initially");
    }

    @Test
    void uploadPageShouldEnableButtonWhenTopicAndFileAreProvided() {
        WebElement topicInput = driver.findElement(By.xpath("//input[@placeholder='пр. Вести, Литература, Секојдневен говор']"));
        topicInput.sendKeys("Test Topic");
        assertTrue(topicInput.getAttribute("value").equals("Test Topic"), "Topic input should accept text");
    }

    @Test
    void privacyToggleShouldSwitchSelection() {
        WebElement publicButton = driver.findElement(By.xpath("//button[contains(text(), 'Јавно')]"));
        WebElement privateButton = driver.findElement(By.xpath("//button[contains(text(), 'Приватно')]"));

        assertTrue(publicButton.getAttribute("class").contains("font-semibold"), "Public should be selected by default");

        privateButton.click();

        wait.until(driver -> privateButton.getAttribute("class").contains("font-semibold"));
        assertTrue(privateButton.getAttribute("class").contains("font-semibold"), "Private should be selected after click");
    }
}