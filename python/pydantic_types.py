from torch import Generator, Tensor, FloatTensor
from PIL.Image import Image

from typing import Annotated, Any

from pydantic_core import core_schema

from pydantic import (
    GetCoreSchemaHandler,
    GetJsonSchemaHandler,
)
from pydantic.json_schema import JsonSchemaValue


def custom_pydantic_annotation(json_schema: JsonSchemaValue) -> type:
    class _PydanticAnnotation:
        @classmethod
        def __get_pydantic_core_schema__(
            cls,
            _source_type: Any,
            _handler: GetCoreSchemaHandler,
        ) -> core_schema.CoreSchema:
            return core_schema.is_instance_schema(cls)

        @classmethod
        def __get_pydantic_json_schema__(
            cls, _core_schema: core_schema.CoreSchema, _handler: GetJsonSchemaHandler
        ) -> JsonSchemaValue:
            return json_schema

    return _PydanticAnnotation


# We now create an `Annotated` wrapper that we'll use as the annotation for fields on `BaseModel`s, etc.
GeneratorType = Annotated[
    Generator,
    custom_pydantic_annotation({"type": "object", "format": "torch-generator"}),
]

TensorType = Annotated[
    Tensor,
    custom_pydantic_annotation({"type": "object", "format": "torch-tensor"}),
]

FloatTensorType = Annotated[
    FloatTensor,
    custom_pydantic_annotation({"type": "object", "format": "torch-float-tensor"}),
]

ImageType = Annotated[
    Image, custom_pydantic_annotation({"type": "object", "format": "pil-image"})
]
