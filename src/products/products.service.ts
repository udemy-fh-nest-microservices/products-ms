import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common/dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(ProductsService.name);

  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to database');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({ data: createProductDto });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;

    const [totalPages, products] = await this.$transaction([
      this.product.count({
        where: { available: true },
      }),
      this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { available: true },
      }),
    ]);

    return {
      meta: {
        current: page,
        last: Math.ceil(totalPages / limit),
        total: totalPages,
      },
      data: products,
    };
  }

  async findOne(id: number) {
    const foundProduct = await this.product.findUnique({
      where: { id, available: true },
    });

    if (!foundProduct) {
      throw new RpcException({
        message: `Product with id ${id} not found`,
        status: HttpStatus.NOT_FOUND,
      });
    }

    return foundProduct;
  }

  async update(updateProductDto: UpdateProductDto) {
    const { id, ...updateData } = updateProductDto;

    const foundProduct = await this.findOne(id);

    return this.product.update({
      where: { id: foundProduct.id },
      data: updateData,
    });
  }

  async remove(id: number) {
    const foundProduct = await this.findOne(id);

    return this.product.update({
      where: { id: foundProduct.id },
      data: { available: false },
    });
  }

  async validateProducts(ids: number[]) {
    const uniqueIds = Array.from(new Set(ids));

    const foundProducts = await this.product.findMany({
      where: { id: { in: uniqueIds }, available: true },
    });

    if (uniqueIds.length !== foundProducts.length) {
      throw new RpcException({
        message: 'One or more products not found',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return foundProducts;
  }
}
