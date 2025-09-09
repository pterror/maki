def assert_unchecked[T](value: T | None) -> T:
    """
    UNSAFELY asserts that a value is not `None`.
    This is REQUIRED due to issues with `diffusers`' type annotations.
    """
    return value  # pyright: ignore[reportReturnType]
