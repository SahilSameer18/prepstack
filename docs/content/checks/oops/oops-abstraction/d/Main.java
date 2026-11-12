interface Rule { boolean ok(int n); }
public class Main {
    public static void main(String[] args) {
        Rule even = n -> n % 2 == 0;
        System.out.println(even.ok(4) + " " + even.ok(5));
    }
}
