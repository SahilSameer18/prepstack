interface Greeter { int MAX = 3; }
public class Bad {
    public static void main(String[] args) { Greeter.MAX = 4; }
}
