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

import static org.junit.jupiter.api.Assertions.assertTrue;

class AdminPageSeleniumTest {

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

        driver.get(BASE_URL + "/admin");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//h1[contains(text(), 'Преглед и проверка')]")));
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    void adminPageShouldDisplayPendingDocumentsSection() {
        WebElement section = driver.findElement(By.xpath("//*[contains(text(), 'Документи за проверка')]"));
        assertTrue(section.isDisplayed(), "Pending Documents section should be visible");
    }

    @Test
    void clickingUserManagementShouldShowUserList() {
        WebElement userMgmtBtn = driver.findElement(By.xpath("//*[contains(text(), 'Управување со корисници')]"));
        userMgmtBtn.click();

        wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//input[@placeholder='Пребарај по е-пошта или ime...']")));
        
        WebElement searchInput = driver.findElement(By.xpath("//input[@placeholder='Пребарај по е-пошта или ime...']"));
        assertTrue(searchInput.isDisplayed(), "User management search should be visible");
    }
}