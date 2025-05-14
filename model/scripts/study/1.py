# 这行代码从transformers库中导入了两个类：AutoModelForCausalLM用于因果语言模型，AutoTokenizer用于分词器。
from transformers import AutoModelForCausalLM, AutoTokenizer

# 这行代码定义了一个字符串变量model_name，它指定了要使用的预训练模型的名称。
model_name = "Qwen/Qwen2.5-3B-Instruct"

# 这行代码使用from_pretrained方法从指定的预训练模型加载一个因果语言模型实例。torch_dtype="auto"表示自动选择合适的数据类型，device_map="auto"表示自动将模型映射到合适的设备（如CPU或GPU）。
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype="auto",
    device_map="auto"
)
# 这行代码使用from_pretrained方法从指定的预训练模型加载一个分词器实例。
tokenizer = AutoTokenizer.from_pretrained(model_name)

prompt = "Give me a short introduction to large language model."

# 这行代码定义了一个列表messages，其中包含两个字典，分别表示系统和用户的消息。系统消息定义了模型的身份，用户消息包含了提示文本。
messages = [
    {"role": "system", "content": "You are Qwen, created by Alibaba Cloud. You are a helpful assistant."},
    {"role": "user", "content": prompt},
]

# 这行代码使用分词器的apply_chat_template方法将消息列表转换为一个适合模型输入的字符串。tokenize=False表示不立即分词，add_generation_prompt=True表示添加生成提示。
text = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True,
)

# 这行代码使用分词器将文本转换为模型输入的张量，并将其移动到模型的设备上（CPU或GPU）。
model_inputs = tokenizer([text], return_tensors="pt").to(model.device)


# 这行代码使用模型的generate方法生成新的标记ID。max_new_tokens=512表示最多生成512个新标记。
generated_ids = model.generate(
    **model_inputs,
    max_new_tokens=512,
)

# 这行代码从生成的标记ID中提取出新增的部分，去掉输入部分的标记ID。
generated_ids = [
    output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
]

# 这行代码使用分词器的batch_decode方法将生成的标记ID解码为文本，并跳过特殊标记。最终结果存储在变量response中。
response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]