interface A { default String hi() { return "A"; } }
interface B { default String hi() { return "B"; } }
class Both implements A, B { }
public class Bad { public static void main(String[] a) { } }
