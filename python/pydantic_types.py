from torch import Generator, Tensor
from PIL.Image import Image

from typing import Annotated, Any

from pydantic_core import core_schema

from pydantic import (
    GetCoreSchemaHandler,
    GetJsonSchemaHandler,
)
from pydantic.json_schema import JsonSchemaValue


def custom_pydantic_annotation(cls: type, json_schema: JsonSchemaValue) -> type:
    class _PydanticAnnotation:
        @classmethod
        def __get_pydantic_core_schema__(
            cls,
            _source_type: Any,
            _handler: GetCoreSchemaHandler,
        ) -> core_schema.CoreSchema:
            return core_schema.json_or_python_schema(
                json_schema=json_schema,  # pyright: ignore[reportArgumentType]
                python_schema=core_schema.is_instance_schema(cls),
            )

        @classmethod
        def __get_pydantic_json_schema__(
            cls, _core_schema: core_schema.CoreSchema, handler: GetJsonSchemaHandler
        ) -> JsonSchemaValue:
            return handler(json_schema)  # pyright: ignore[reportArgumentType]

    return _PydanticAnnotation


# We now create an `Annotated` wrapper that we'll use as the annotation for fields on `BaseModel`s, etc.
GeneratorType = Annotated[
    Generator,
    custom_pydantic_annotation(
        Generator, {"type": "object", "format": "torch-generator"}
    ),
]

TensorType = Annotated[
    Tensor,
    custom_pydantic_annotation(Tensor, {"type": "object", "format": "torch-tensor"}),
]

ImageType = Annotated[
    Image, custom_pydantic_annotation(Image, {"type": "object", "format": "pil-image"})
]
