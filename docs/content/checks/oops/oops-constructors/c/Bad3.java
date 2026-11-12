class Base { Base(int x) { } }
class Child extends Base { Child() { super(1); } }
public class Bad3 { public static void main(String[] a) { new Child(5); } }
