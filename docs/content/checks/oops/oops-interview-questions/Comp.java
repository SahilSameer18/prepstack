import java.util.ArrayList;
import java.util.List;

public class Comp {
    static class Bag extends ArrayList<String> { }          // inheritance
    static class Basket {                                    // composition
        private final List<String> items = new ArrayList<>();
        void add(String s) { items.add(s); }
        int count() { return items.size(); }
    }
    public static void main(String[] args) {
        Bag bag = new Bag();
        bag.add("apple");
        bag.clear();                 // inherited, so callers can do this too
        System.out.println(bag.size());
        Basket basket = new Basket();
        basket.add("apple");
        System.out.println(basket.count());
    }
}
