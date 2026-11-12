import java.util.ArrayList;
public class BadComp {
    static class Basket { private final ArrayList<String> items = new ArrayList<>(); }
    public static void main(String[] args) {
        new Basket().clear();
    }
}
